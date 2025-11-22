import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import toast from 'react-hot-toast';

interface PageContent {
    slug: string;
    content: string;
}

const pages = [
    { slug: 'mission', title: 'Mission' },
    { slug: 'vision', title: 'Vision' },
    { slug: 'aim_scope', title: 'Aim & Scope' },
    { slug: 'processing_charge', title: 'Processing Charge' },
    { slug: 'indexing', title: 'Indexing' },
    { slug: 'call_for_paper', title: 'Call for Papers' },
    { slug: 'contact', title: 'Contact' }
];

const PageContentEditor: React.FC = () => {
    const [selectedPage, setSelectedPage] = useState<string>('mission');
    const [content, setContent] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchPageContent(selectedPage);
    }, [selectedPage]);

    const fetchPageContent = async (slug: string) => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/public/page-content/${slug}`);

            if (response.data.success) {
                setContent(response.data.data.content);
            }
        } catch (error) {
            console.error('Error fetching page content:', error);
            toast.error('Failed to load page content');
            setContent('');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const response = await axios.put(`/api/admin/page-content/${selectedPage}`, {
                content
            });

            if (response.data.success) {
                toast.success('Page content updated successfully!');
            } else {
                throw new Error('Failed to update page content');
            }
        } catch (error) {
            console.error('Error saving page content:', error);
            toast.error('Failed to save page content');
        } finally {
            setSaving(false);
        }
    };

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }],
            ['link'],
            ['clean']
        ]
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-secondary-900 mb-2">
                    Page Content Editor
                </h1>
                <p className="text-secondary-600">
                    Edit the content of static pages that will be displayed on your website.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar - Page List */}
                <div className="lg:col-span-1">
                    <div className="card">
                        <div className="card-body">
                            <h2 className="text-lg font-semibold text-secondary-900 mb-4">Pages</h2>
                            <nav className="space-y-1">
                                {pages.map((page) => (
                                    <button
                                        key={page.slug}
                                        onClick={() => setSelectedPage(page.slug)}
                                        className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${selectedPage === page.slug
                                                ? 'bg-primary-100 text-primary-700'
                                                : 'text-secondary-700 hover:bg-secondary-100'
                                            }`}
                                    >
                                        {page.title}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>
                </div>

                {/* Main Content - Editor */}
                <div className="lg:col-span-3">
                    <div className="card">
                        <div className="card-body">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-secondary-900">
                                    {pages.find(p => p.slug === selectedPage)?.title}
                                </h2>
                                <button
                                    onClick={handleSave}
                                    disabled={saving || loading}
                                    className="btn btn-primary"
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>

                            {loading ? (
                                <div className="animate-pulse space-y-4">
                                    <div className="h-10 bg-secondary-200 rounded"></div>
                                    <div className="h-64 bg-secondary-200 rounded"></div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <ReactQuill
                                        theme="snow"
                                        value={content}
                                        onChange={setContent}
                                        modules={modules}
                                        className="bg-white"
                                        style={{ height: '400px', marginBottom: '50px' }}
                                    />

                                    <div className="mt-16 pt-4 border-t border-secondary-200">
                                        <h3 className="text-sm font-semibold text-secondary-900 mb-2">Preview</h3>
                                        <div
                                            className="prose max-w-none p-4 bg-secondary-50 rounded-lg"
                                            dangerouslySetInnerHTML={{ __html: content }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PageContentEditor;

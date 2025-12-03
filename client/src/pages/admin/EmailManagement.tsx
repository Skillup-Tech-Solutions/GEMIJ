import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Edit2, Send, Users, FileText, Check, X, AlertCircle } from 'lucide-react';
import adminService from '@/services/adminService';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Alert from '@/components/ui/Alert';
import { EmailTemplate } from '@/types/email';
import { UserManagementData } from '@/services/adminService';

const EmailManagement: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'templates' | 'send'>('templates');
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Template Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        subject: '',
        htmlContent: '',
        textContent: '',
        variables: ''
    });

    // Send Email State
    const [selectedTemplateId, setSelectedTemplateId] = useState('');
    const [recipientType, setRecipientType] = useState<'ALL_AUTHORS' | 'ALL_REVIEWERS' | 'ALL_USERS' | 'SPECIFIC' | 'CUSTOM'>('ALL_AUTHORS');
    const [subjectOverride, setSubjectOverride] = useState('');
    const [users, setUsers] = useState<UserManagementData[]>([]);
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [customEmails, setCustomEmails] = useState('');
    const [userSearch, setUserSearch] = useState('');
    const [sending, setSending] = useState(false);
    const [sendResult, setSendResult] = useState<{ total: number; sent: number; failed: number } | null>(null);

    useEffect(() => {
        loadTemplates();
    }, []);

    useEffect(() => {
        if (activeTab === 'send' && recipientType === 'SPECIFIC') {
            loadUsers();
        }
    }, [activeTab, recipientType]);

    const loadTemplates = async () => {
        setLoading(true);
        try {
            const data = await adminService.getEmailTemplates();
            setTemplates(data);
        } catch (error) {
            console.error('Failed to load templates:', error);
            setMessage({ type: 'error', text: 'Failed to load email templates' });
        } finally {
            setLoading(false);
        }
    };

    const loadUsers = async () => {
        try {
            const { users } = await adminService.getAllUsers({ limit: 1000 }); // Load all for now, or implement search
            setUsers(users);
        } catch (error) {
            console.error('Failed to load users:', error);
        }
    };

    const handleSaveTemplate = async () => {
        try {
            const variablesArray = formData.variables.split(',').map(v => v.trim()).filter(v => v);

            const templateData = {
                ...formData,
                variables: variablesArray
            };

            if (editingTemplate) {
                await adminService.updateEmailTemplate(editingTemplate.id, templateData);
                setMessage({ type: 'success', text: 'Template updated successfully' });
            } else {
                await adminService.createEmailTemplate(templateData);
                setMessage({ type: 'success', text: 'Template created successfully' });
            }

            setIsModalOpen(false);
            loadTemplates();
            resetForm();
        } catch (error) {
            console.error('Failed to save template:', error);
            setMessage({ type: 'error', text: 'Failed to save template' });
        }
    };

    const handleDeleteTemplate = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this template?')) return;

        try {
            await adminService.deleteEmailTemplate(id);
            setMessage({ type: 'success', text: 'Template deleted successfully' });
            loadTemplates();
        } catch (error) {
            console.error('Failed to delete template:', error);
            setMessage({ type: 'error', text: 'Failed to delete template' });
        }
    };

    const handleSendEmail = async () => {
        if (!selectedTemplateId) {
            setMessage({ type: 'error', text: 'Please select a template' });
            return;
        }

        if (recipientType === 'SPECIFIC' && selectedUserIds.length === 0) {
            setMessage({ type: 'error', text: 'Please select at least one recipient' });
            return;
        }

        let customEmailsList: string[] = [];
        if (recipientType === 'CUSTOM') {
            customEmailsList = customEmails.split(/[\n,]+/).map(e => e.trim()).filter(e => e);
            if (customEmailsList.length === 0) {
                setMessage({ type: 'error', text: 'Please enter at least one email address' });
                return;
            }
            // Basic validation
            const invalidEmails = customEmailsList.filter(e => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
            if (invalidEmails.length > 0) {
                setMessage({ type: 'error', text: `Invalid email addresses: ${invalidEmails.join(', ')}` });
                return;
            }
        }

        if (!window.confirm('Are you sure you want to send this bulk email? This action cannot be undone.')) return;

        setSending(true);
        setSendResult(null);
        try {
            const result = await adminService.sendBulkEmail({
                templateId: selectedTemplateId,
                recipientType,
                specificUserIds: recipientType === 'SPECIFIC' ? selectedUserIds : undefined,
                customEmails: recipientType === 'CUSTOM' ? customEmailsList : undefined,
                subjectOverride: subjectOverride || undefined
            });
            setSendResult(result);
            setMessage({ type: 'success', text: `Emails sent: ${result.sent} success, ${result.failed} failed` });
        } catch (error) {
            console.error('Failed to send emails:', error);
            setMessage({ type: 'error', text: 'Failed to send emails' });
        } finally {
            setSending(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            subject: '',
            htmlContent: '',
            textContent: '',
            variables: ''
        });
        setEditingTemplate(null);
    };

    const openEditModal = (template: EmailTemplate) => {
        setEditingTemplate(template);
        setFormData({
            name: template.name,
            subject: template.subject,
            htmlContent: template.htmlContent,
            textContent: template.textContent || '',
            variables: template.variables.join(', ')
        });
        setIsModalOpen(true);
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearch.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Email Management</h1>
                    <p className="text-slate-600 mt-2">Manage email templates and send bulk communications</p>
                </div>
                <div className="flex space-x-4">
                    <button
                        onClick={() => setActiveTab('templates')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'templates'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                            }`}
                    >
                        Templates
                    </button>
                    <button
                        onClick={() => setActiveTab('send')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'send'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                            }`}
                    >
                        Send Email
                    </button>
                </div>
            </div>

            {message && (
                <Alert
                    variant={message.type}
                    title={message.type === 'success' ? 'Success' : 'Error'}
                    className="mb-6"
                    onClose={() => setMessage(null)}
                >
                    {message.text}
                </Alert>
            )}

            {activeTab === 'templates' ? (
                <div className="space-y-6">
                    <div className="flex justify-end">
                        <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Template
                        </Button>
                    </div>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {templates.map(template => (
                                <div key={template.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-900">{template.name}</h3>
                                            <p className="text-slate-500 text-sm mt-1">Subject: {template.subject}</p>
                                            <div className="flex gap-2 mt-2">
                                                {template.variables.map(v => (
                                                    <span key={v} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md">
                                                        {v}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => openEditModal(template)}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteTemplate(template.id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {templates.length === 0 && (
                                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                    <p className="text-slate-500">No templates found. Create one to get started.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Select Template</label>
                            <select
                                value={selectedTemplateId}
                                onChange={(e) => setSelectedTemplateId(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Select a template...</option>
                                {templates.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Subject Override (Optional)</label>
                            <input
                                type="text"
                                value={subjectOverride}
                                onChange={(e) => setSubjectOverride(e.target.value)}
                                placeholder="Leave blank to use template subject"
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Recipients</label>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                {[
                                    { id: 'ALL_AUTHORS', label: 'All Authors', icon: Users },
                                    { id: 'ALL_REVIEWERS', label: 'All Reviewers', icon: Users },
                                    { id: 'ALL_USERS', label: 'All Users', icon: Users },
                                    { id: 'SPECIFIC', label: 'Specific Users', icon: Users },
                                    { id: 'CUSTOM', label: 'Custom Emails', icon: Users },
                                ].map((type) => (
                                    <button
                                        key={type.id}
                                        onClick={() => setRecipientType(type.id as any)}
                                        className={`flex items-center p-4 rounded-lg border-2 transition-all ${recipientType === type.id
                                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                                            : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                                            }`}
                                    >
                                        <type.icon className={`w-5 h-5 mr-3 ${recipientType === type.id ? 'text-blue-600' : 'text-slate-400'}`} />
                                        <span className="font-medium">{type.label}</span>
                                    </button>
                                ))}
                            </div>

                            {recipientType === 'SPECIFIC' && (
                                <div className="mt-4 border border-slate-200 rounded-lg p-4">
                                    <input
                                        type="text"
                                        placeholder="Search users..."
                                        value={userSearch}
                                        onChange={(e) => setUserSearch(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg mb-4"
                                    />
                                    <div className="max-h-60 overflow-y-auto space-y-2">
                                        {filteredUsers.map(user => (
                                            <label key={user.id} className="flex items-center p-2 hover:bg-slate-50 rounded cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedUserIds.includes(user.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedUserIds([...selectedUserIds, user.id]);
                                                        } else {
                                                            setSelectedUserIds(selectedUserIds.filter(id => id !== user.id));
                                                        }
                                                    }}
                                                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                                                />
                                                <div className="ml-3">
                                                    <p className="text-sm font-medium text-slate-900">{user.name}</p>
                                                    <p className="text-xs text-slate-500">{user.email} • {user.role}</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                    <p className="text-sm text-slate-500 mt-2">
                                        {selectedUserIds.length} users selected
                                    </p>
                                </div>
                            )}

                            {recipientType === 'CUSTOM' && (
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Enter Email Addresses (comma or new line separated)
                                    </label>
                                    <textarea
                                        value={customEmails}
                                        onChange={(e) => setCustomEmails(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                                        rows={5}
                                        placeholder="user1@example.com, user2@example.com"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">
                                        Enter valid email addresses separated by commas or new lines.
                                    </p>
                                </div>
                            )}
                        </div>

                        {sendResult && (
                            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                <h4 className="font-medium text-slate-900 mb-2">Last Send Result</h4>
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <div className="text-2xl font-bold text-slate-900">{sendResult.total}</div>
                                        <div className="text-xs text-slate-500 uppercase tracking-wide">Total</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-green-600">{sendResult.sent}</div>
                                        <div className="text-xs text-slate-500 uppercase tracking-wide">Sent</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-red-600">{sendResult.failed}</div>
                                        <div className="text-xs text-slate-500 uppercase tracking-wide">Failed</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="pt-4 border-t border-slate-100">
                            <Button
                                onClick={handleSendEmail}
                                disabled={sending || !selectedTemplateId || (recipientType === 'SPECIFIC' && selectedUserIds.length === 0) || (recipientType === 'CUSTOM' && !customEmails.trim())}
                                className="w-full justify-center py-3 text-lg"
                            >
                                {sending ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5 mr-2" />
                                        Send Bulk Email
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingTemplate ? 'Edit Template' : 'Create Template'}
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveTemplate}>Save Template</Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Template Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., Call for Papers 2024"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Subject Line</label>
                        <input
                            type="text"
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Email subject..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">HTML Content</label>
                        <textarea
                            value={formData.htmlContent}
                            onChange={(e) => setFormData({ ...formData, htmlContent: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                            rows={10}
                            placeholder="<html>...</html>"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Text Content (Optional)</label>
                        <textarea
                            value={formData.textContent}
                            onChange={(e) => setFormData({ ...formData, textContent: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                            rows={4}
                            placeholder="Plain text version..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Variables (comma separated)</label>
                        <input
                            type="text"
                            value={formData.variables}
                            onChange={(e) => setFormData({ ...formData, variables: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="firstName, lastName, journalName"
                        />
                        <p className="text-xs text-slate-500 mt-1">Available variables: firstName, lastName, email, journalName, journalUrl</p>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default EmailManagement;

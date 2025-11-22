import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const pageContent = {
    mission: `<div class="space-y-6">
    <section class="card">
      <div class="card-body">
        <h2 class="text-2xl font-semibold text-secondary-900 mb-4">Mission Statement</h2>
        <p class="text-secondary-700 leading-relaxed mb-4">
          The International Journal of Advanced Technology, Engineering and Management (IJATEM) is committed to 
          advancing knowledge and fostering innovation in the fields of technology, engineering, and management sciences.
        </p>
        <p class="text-secondary-700 leading-relaxed mb-4">
          Our mission is to provide a premier platform for researchers, academics, and industry professionals to 
          disseminate their cutting-edge research, share innovative ideas, and contribute to the global body of knowledge.
        </p>
      </div>
    </section>
    <section class="card">
      <div class="card-body">
        <h2 class="text-2xl font-semibold text-secondary-900 mb-4">Our Commitment</h2>
        <ul class="space-y-3 text-secondary-700">
          <li class="flex items-start"><span class="text-primary-600 mr-2">•</span><span>Promote excellence in research and scholarship across multidisciplinary domains</span></li>
          <li class="flex items-start"><span class="text-primary-600 mr-2">•</span><span>Facilitate the rapid dissemination of high-quality research findings</span></li>
          <li class="flex items-start"><span class="text-primary-600 mr-2">•</span><span>Foster collaboration between academia and industry</span></li>
          <li class="flex items-start"><span class="text-primary-600 mr-2">•</span><span>Maintain the highest standards of peer review and editorial integrity</span></li>
          <li class="flex items-start"><span class="text-primary-600 mr-2">•</span><span>Provide open access to research for the global scientific community</span></li>
        </ul>
      </div>
    </section>
  </div>`,

    vision: `<div class="space-y-6">
    <section class="card">
      <div class="card-body">
        <h2 class="text-2xl font-semibold text-secondary-900 mb-4">Vision Statement</h2>
        <p class="text-secondary-700 leading-relaxed mb-4">
          To become a globally recognized, leading international journal that serves as the premier destination 
          for groundbreaking research in advanced technology, engineering, and management sciences.
        </p>
      </div>
    </section>
    <section class="card">
      <div class="card-body">
        <h2 class="text-2xl font-semibold text-secondary-900 mb-4">Strategic Goals</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 class="text-lg font-semibold text-secondary-900 mb-3">Academic Excellence</h3>
            <p class="text-secondary-700">Maintain the highest standards of peer review and editorial quality.</p>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-secondary-900 mb-3">Global Impact</h3>
            <p class="text-secondary-700">Expand our reach to researchers and institutions worldwide.</p>
          </div>
        </div>
      </div>
    </section>
  </div>`,

    aim_scope: `<div class="space-y-6">
    <section class="card">
      <div class="card-body">
        <h2 class="text-2xl font-semibold text-secondary-900 mb-4">Journal Aim</h2>
        <p class="text-secondary-700 leading-relaxed">
          IJATEM aims to publish original, high-quality research that advances the state-of-the-art in technology, 
          engineering, and management sciences.
        </p>
      </div>
    </section>
    <section class="card">
      <div class="card-body">
        <h2 class="text-2xl font-semibold text-secondary-900 mb-4">Scope of Publication</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="border-l-4 border-primary-500 pl-4">
            <h3 class="text-lg font-semibold text-secondary-900 mb-3">Computer Science & Technology</h3>
            <ul class="space-y-2 text-secondary-700">
              <li>• Artificial Intelligence & Machine Learning</li>
              <li>• Data Science & Big Data Analytics</li>
              <li>• Cybersecurity & Information Security</li>
            </ul>
          </div>
          <div class="border-l-4 border-primary-500 pl-4">
            <h3 class="text-lg font-semibold text-secondary-900 mb-3">Engineering Disciplines</h3>
            <ul class="space-y-2 text-secondary-700">
              <li>• Electrical & Electronics Engineering</li>
              <li>• Mechanical & Manufacturing Engineering</li>
              <li>• Robotics & Automation</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  </div>`,

    processing_charge: `<div class="space-y-6">
    <section class="card">
      <div class="card-body">
        <h2 class="text-2xl font-semibold text-secondary-900 mb-4">Open Access Publishing Model</h2>
        <p class="text-secondary-700 leading-relaxed">
          IJATEM operates under an open access publishing model. To sustain this model, we charge an 
          Article Processing Charge (APC) for accepted manuscripts.
        </p>
      </div>
    </section>
    <section class="card bg-primary-50 border-2 border-primary-200">
      <div class="card-body">
        <h2 class="text-2xl font-semibold text-secondary-900 mb-4">Current APC Fee</h2>
        <div class="text-center py-4">
          <p class="text-4xl font-bold text-primary-600 mb-2">₹20,000</p>
          <p class="text-lg text-secondary-700">per accepted article</p>
        </div>
      </div>
    </section>
  </div>`,

    indexing: `<div class="space-y-6">
    <section class="card">
      <div class="card-body">
        <h2 class="text-2xl font-semibold text-secondary-900 mb-4">Our Commitment to Visibility</h2>
        <p class="text-secondary-700 leading-relaxed">
          IJATEM is committed to ensuring maximum visibility and discoverability of published research.
        </p>
      </div>
    </section>
    <section class="card">
      <div class="card-body">
        <h2 class="text-2xl font-semibold text-secondary-900 mb-4">Current Indexing Status</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex items-start p-4 bg-secondary-50 rounded-lg">
            <span class="text-primary-600 mr-3 text-xl">✓</span>
            <div>
              <h3 class="font-semibold text-secondary-900">Google Scholar</h3>
              <p class="text-sm text-secondary-600">Full-text indexing and citation tracking</p>
            </div>
          </div>
          <div class="flex items-start p-4 bg-secondary-50 rounded-lg">
            <span class="text-primary-600 mr-3 text-xl">✓</span>
            <div>
              <h3 class="font-semibold text-secondary-900">CrossRef</h3>
              <p class="text-sm text-secondary-600">DOI registration and metadata distribution</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>`,

    call_for_paper: `<div class="space-y-6">
    <section class="card bg-primary-50 border-2 border-primary-200">
      <div class="card-body">
        <h2 class="text-2xl font-semibold text-secondary-900 mb-4">Submit Your Research to IJATEM</h2>
        <p class="text-secondary-700 leading-relaxed mb-4">
          We invite researchers, academics, and industry professionals to submit their original research for publication.
        </p>
        <div class="text-center mt-6">
          <a href="/submit-paper" class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors">
            Submit Your Manuscript
          </a>
        </div>
      </div>
    </section>
    <section class="card">
      <div class="card-body">
        <h2 class="text-2xl font-semibold text-secondary-900 mb-4">Why Publish with IJATEM?</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="flex items-start">
            <span class="text-primary-600 mr-3 text-2xl">✓</span>
            <div>
              <h3 class="font-semibold text-secondary-900 mb-2">Open Access</h3>
              <p class="text-secondary-700">Your research will be freely accessible worldwide.</p>
            </div>
          </div>
          <div class="flex items-start">
            <span class="text-primary-600 mr-3 text-2xl">✓</span>
            <div>
              <h3 class="font-semibold text-secondary-900 mb-2">Rigorous Peer Review</h3>
              <p class="text-secondary-700">Double-blind peer review by experts.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>`,

    contact: `<div class="space-y-6">
    <section class="card">
      <div class="card-body">
        <h2 class="text-2xl font-semibold text-secondary-900 mb-6">Editorial Office</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 class="font-semibold text-secondary-900 mb-3">Address</h3>
            <p class="text-secondary-700 leading-relaxed">
              IJATEM Editorial Office<br />
              123 Academic Street<br />
              Research City, RC 12345<br />
              India
            </p>
          </div>
          <div>
            <h3 class="font-semibold text-secondary-900 mb-3">Contact Information</h3>
            <div class="space-y-2 text-secondary-700">
              <p><span class="font-medium">Email:</span> <a href="mailto:editor@ijatem.com" class="text-primary-600 hover:text-primary-700">editor@ijatem.com</a></p>
              <p><span class="font-medium">Phone:</span> +91 (555) 123-4567</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>`
};

async function seedPageContent() {
    console.log('🌱 Seeding page content...');

    try {
        for (const [slug, content] of Object.entries(pageContent)) {
            const key = `page_${slug}_content`;

            await prisma.systemSettings.upsert({
                where: { key },
                update: { value: content, type: 'string' },
                create: { key, value: content, type: 'string' }
            });

            console.log(`✓ Seeded content for: ${slug}`);
        }

        console.log('✅ Page content seeding completed successfully!');
    } catch (error) {
        console.error('❌ Error seeding page content:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

seedPageContent();

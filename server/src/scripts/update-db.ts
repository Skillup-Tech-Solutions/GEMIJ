import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { execSync } from 'child_process';

const envPath = path.resolve(__dirname, '../../.env');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query: string): Promise<string> => {
    return new Promise((resolve) => {
        rl.question(query, resolve);
    });
};

async function main() {
    try {
        // 1. Read .env file
        let envContent = '';
        if (fs.existsSync(envPath)) {
            envContent = fs.readFileSync(envPath, 'utf-8');
        } else {
            console.log('.env file not found. Creating new one.');
        }

        // 2. Extract current DATABASE_URL_REMOTE
        const dbUrlMatch = envContent.match(/^DATABASE_URL_REMOTE=(.*)$/m);
        const currentDbUrl = dbUrlMatch ? dbUrlMatch[1] : 'Not set';

        console.log(`\nCurrent DATABASE_URL_REMOTE: ${currentDbUrl}\n`);

        // 3. Ask to update
        const shouldUpdate = await question('Do you want to update the DATABASE_URL_REMOTE? (y/N): ');

        if (shouldUpdate.toLowerCase() === 'y') {
            const newDbUrl = await question('Enter new DATABASE_URL_REMOTE: ');
            if (newDbUrl.trim()) {
                if (envContent.includes('DATABASE_URL_REMOTE=')) {
                    envContent = envContent.replace(/^DATABASE_URL_REMOTE=.*$/m, `DATABASE_URL_REMOTE="${newDbUrl.trim()}"`);
                } else {
                    envContent += `\nDATABASE_URL_REMOTE="${newDbUrl.trim()}"\n`;
                }
                fs.writeFileSync(envPath, envContent);
                console.log('Updated .env file.');
            } else {
                console.log('No URL entered. Skipping update.');
            }
        }

        // 4. Run prisma db push
        console.log('\nRunning prisma db push...');

        // Get the final URL to use
        const finalDbUrlMatch = envContent.match(/^DATABASE_URL_REMOTE=(.*)$/m);
        const finalDbUrl = finalDbUrlMatch ? finalDbUrlMatch[1].replace(/"/g, '') : '';

        if (!finalDbUrl) {
            console.error('Error: DATABASE_URL_REMOTE not found in .env');
            return;
        }

        const env = { ...process.env, DATABASE_URL: finalDbUrl };

        execSync('npx prisma db push', {
            stdio: 'inherit',
            cwd: path.resolve(__dirname, '../../'),
            env: env
        });

        // 5. Run prisma generate
        console.log('\nRunning prisma generate...');
        execSync('npx prisma generate', {
            stdio: 'inherit',
            cwd: path.resolve(__dirname, '../../'),
            env: env
        });

        console.log('\nDatabase update completed successfully!');

    } catch (error) {
        console.error('\nError updating database:', error);
    } finally {
        rl.close();
    }
}

main();

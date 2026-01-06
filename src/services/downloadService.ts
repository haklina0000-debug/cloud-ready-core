/**
 * Download Service
 * ================
 * Handles project downloads as ZIP files.
 */

import JSZip from 'jszip';

export interface ProjectFile {
  path: string;
  content: string;
  type?: 'text' | 'binary';
}

export interface DownloadResult {
  success: boolean;
  filename?: string;
  error?: string;
}

/**
 * Create a ZIP file from project files
 */
export const createProjectZip = async (
  projectName: string,
  files: ProjectFile[]
): Promise<Blob> => {
  const zip = new JSZip();
  
  // Add each file to the zip
  for (const file of files) {
    zip.file(file.path, file.content);
  }
  
  // Generate the zip file
  return await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });
};

/**
 * Download a blob as a file
 */
export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Download project as ZIP
 */
export const downloadProjectAsZip = async (
  projectName: string,
  files: ProjectFile[]
): Promise<DownloadResult> => {
  try {
    const blob = await createProjectZip(projectName, files);
    const filename = `${projectName.replace(/\s+/g, '-').toLowerCase()}.zip`;
    downloadBlob(blob, filename);
    
    return {
      success: true,
      filename,
    };
  } catch (error) {
    console.error('[Download] Failed to create ZIP:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'فشل في إنشاء ملف ZIP',
    };
  }
};

/**
 * Create demo project files
 */
export const createDemoProjectFiles = (projectName: string): ProjectFile[] => {
  const sanitizedName = projectName.replace(/\s+/g, '-').toLowerCase();
  
  return [
    {
      path: 'index.html',
      content: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectName}</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <nav>
            <h1>${projectName}</h1>
        </nav>
    </header>
    <main>
        <section class="hero">
            <h2>مرحباً بك في ${projectName}</h2>
            <p>تم إنشاء هذا المشروع بواسطة NTFLY Studio</p>
        </section>
    </main>
    <footer>
        <p>© ${new Date().getFullYear()} ${projectName}. جميع الحقوق محفوظة.</p>
    </footer>
    <script src="script.js"></script>
</body>
</html>`,
    },
    {
      path: 'styles.css',
      content: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Cairo', 'Segoe UI', sans-serif;
    line-height: 1.6;
    color: #333;
}

header {
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    color: white;
    padding: 1rem;
}

nav h1 {
    font-size: 1.5rem;
}

.hero {
    min-height: 60vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 2rem;
    background: #f8fafc;
}

.hero h2 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    color: #1e293b;
}

.hero p {
    font-size: 1.25rem;
    color: #64748b;
}

footer {
    background: #1e293b;
    color: white;
    text-align: center;
    padding: 1rem;
}`,
    },
    {
      path: 'script.js',
      content: `// ${projectName} JavaScript
console.log('${projectName} loaded successfully!');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM ready');
});`,
    },
    {
      path: 'README.md',
      content: `# ${projectName}

تم إنشاء هذا المشروع بواسطة **NTFLY Studio**.

## البدء

1. افتح \`index.html\` في المتصفح
2. عدّل الملفات حسب الحاجة

## الملفات

- \`index.html\` - الصفحة الرئيسية
- \`styles.css\` - أنماط CSS
- \`script.js\` - JavaScript

## الترخيص

جميع الحقوق محفوظة © ${new Date().getFullYear()}
`,
    },
  ];
};

/**
 * Download demo project
 */
export const downloadDemoProject = async (
  projectName: string = 'my-project'
): Promise<DownloadResult> => {
  const files = createDemoProjectFiles(projectName);
  return downloadProjectAsZip(projectName, files);
};

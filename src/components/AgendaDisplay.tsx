import React, { useState } from 'react';
import { Copy, Download, Check, Clock, MessageSquare, RefreshCw, FileText, File } from 'lucide-react';
import type { Agenda } from '../types';

interface Props {
  agenda: Agenda;
  isGenerating: boolean;
  onRegenerate: () => void;
}

function agendaToMarkdown(agenda: Agenda): string {
  const lines: string[] = [];
  lines.push(`# ${agenda.title}`);
  lines.push(`**Duration:** ${agenda.totalMinutes} minutes`);
  lines.push('');

  for (const item of agenda.items) {
    lines.push(`## ${item.startTime} - ${item.endTime} | ${item.topic} (${item.durationMinutes} min)`);
    lines.push('');
    for (const prompt of item.prompts) {
      lines.push(`- ${prompt}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function downloadPdf(agenda: Agenda) {
  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const usable = pageWidth - margin * 2;
  let y = 20;

  const checkPage = (needed: number) => {
    if (y + needed > 270) {
      doc.addPage();
      y = 20;
    }
  };

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(agenda.title, margin, y);
  y += 8;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 120, 120);
  doc.text(`Duration: ${agenda.totalMinutes} minutes`, margin, y);
  doc.setTextColor(0, 0, 0);
  y += 10;

  // Items
  for (const item of agenda.items) {
    checkPage(30);

    // Time + topic header
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    const header = `${item.startTime} - ${item.endTime}  |  ${item.topic}  (${item.durationMinutes} min)`;
    doc.text(header, margin, y);
    y += 6;

    // Violet accent line
    doc.setDrawColor(139, 92, 246);
    doc.setLineWidth(0.5);
    doc.line(margin, y, margin + usable, y);
    y += 5;

    // Discussion prompts
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    for (const prompt of item.prompts) {
      checkPage(10);
      const lines = doc.splitTextToSize(`  -  ${prompt}`, usable - 5);
      doc.text(lines, margin + 2, y);
      y += lines.length * 5;
    }

    y += 6;
  }

  doc.save(`${slugify(agenda.title)}.pdf`);
}

async function downloadDocx(agenda: Agenda) {
  const { Document, Paragraph, TextRun, Packer, BorderStyle } = await import('docx');
  const { saveAs } = await import('file-saver');

  const children: InstanceType<typeof Paragraph>[] = [];

  // Title
  children.push(
    new Paragraph({
      children: [new TextRun({ text: agenda.title, bold: true, size: 36, font: 'Calibri' })],
      spacing: { after: 100 },
    })
  );

  // Duration subtitle
  children.push(
    new Paragraph({
      children: [new TextRun({ text: `Duration: ${agenda.totalMinutes} minutes`, size: 22, color: '888888', font: 'Calibri' })],
      spacing: { after: 200 },
    })
  );

  // Items
  for (const item of agenda.items) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${item.startTime} - ${item.endTime}`, bold: true, size: 24, font: 'Calibri' }),
          new TextRun({ text: `  |  ${item.topic}  (${item.durationMinutes} min)`, bold: true, size: 24, font: 'Calibri' }),
        ],
        spacing: { before: 200, after: 80 },
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 1, color: '8B5CF6' },
        },
      })
    );

    for (const prompt of item.prompts) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: prompt, size: 20, font: 'Calibri' })],
          bullet: { level: 0 },
          spacing: { after: 40 },
        })
      );
    }
  }

  const doc = new Document({
    sections: [{ children }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${slugify(agenda.title)}.docx`);
}

export const AgendaDisplay: React.FC<Props> = ({ agenda, isGenerating, onRegenerate }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const md = agendaToMarkdown(agenda);
    await navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMd = () => {
    const md = agendaToMarkdown(agenda);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slugify(agenda.title)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Title and export bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-[18px] font-bold text-[#F5F5F5]">{agenda.title}</h2>
          <div className="flex items-center gap-1.5 mt-1">
            <Clock size={14} className="text-[#A3A3A3]" />
            <span className="text-[13px] text-[#A3A3A3]">{agenda.totalMinutes} minutes total</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onRegenerate}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] text-[#A3A3A3] hover:text-[#F5F5F5] border border-[#262626] rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={isGenerating ? 'animate-spin' : ''} />
            Regenerate
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] text-[#A3A3A3] hover:text-[#F5F5F5] border border-[#262626] rounded-lg transition-colors"
          >
            {copied ? <Check size={14} className="text-[#84cc16]" /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={handleDownloadMd}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] text-[#A3A3A3] hover:text-[#F5F5F5] border border-[#262626] rounded-lg transition-colors"
          >
            <Download size={14} />
            .md
          </button>
          <button
            onClick={() => downloadPdf(agenda)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] text-[#A3A3A3] hover:text-[#F5F5F5] border border-[#262626] rounded-lg transition-colors"
          >
            <FileText size={14} />
            .pdf
          </button>
          <button
            onClick={() => downloadDocx(agenda)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] text-[#A3A3A3] hover:text-[#F5F5F5] border border-[#262626] rounded-lg transition-colors"
          >
            <File size={14} />
            .docx
          </button>
        </div>
      </div>

      {/* Agenda items */}
      <div className="flex flex-col gap-3">
        {agenda.items.map((item, i) => (
          <div
            key={i}
            className="border-l-2 border-[#8b5cf6] bg-[#141414] rounded-r-lg px-4 py-3"
          >
            <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-mono text-[#8b5cf6] bg-[#8b5cf6]/10 px-2 py-0.5 rounded">
                  {item.startTime} - {item.endTime}
                </span>
                <h3 className="text-[15px] font-semibold text-[#F5F5F5]">
                  {item.topic}
                </h3>
              </div>
              <span className="text-[12px] font-medium text-[#84cc16] bg-[#84cc16]/10 px-2 py-0.5 rounded-full">
                {item.durationMinutes} min
              </span>
            </div>

            {item.prompts.length > 0 && (
              <div className="flex flex-col gap-1.5 mt-2">
                {item.prompts.map((prompt, j) => (
                  <div key={j} className="flex items-start gap-2">
                    <MessageSquare size={14} className="text-[#525252] mt-0.5 flex-shrink-0" />
                    <p className="text-[13px] text-[#A3A3A3] leading-relaxed">{prompt}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

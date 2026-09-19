/**
 * Utility functions for exporting and converting report query results
 * into multiple file formats: TXT, CSV, Excel (XML Spreadsheet .xls/.xlsx), JSON, and Print.
 */

export interface ExportMetadata {
  title?: string;
  datasetName?: string;
  query?: string;
  generatedBy?: string;
  generatedAt?: string;
  filters?: Record<string, any>;
  totalRows?: number;
  aggregates?: Record<string, number | string>;
  includeQueryHeader?: boolean;
}

/**
 * Escapes special XML characters
 */
function escapeXml(unsafe: string): string {
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Downloads a Blob as a file with the given name
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Converts array of objects to CSV format with UTF-8 BOM
 */
export function exportToCSV(data: any[], filename: string, metadata?: ExportMetadata): void {
  if (!data || data.length === 0) {
    alert('No data rows to export.');
    return;
  }

  const columns = Object.keys(data[0]);
  const headerRow = columns.map((col) => `"${col.replace(/"/g, '""')}"`).join(',');

  const dataRows = data.map((row) =>
    columns
      .map((col) => {
        const val = row[col];
        if (val === null || val === undefined) return '""';
        if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
        const strVal = String(val).replace(/"/g, '""');
        return `"${strVal}"`;
      })
      .join(',')
  );

  const metaLines: string[] = [];
  if (metadata?.includeQueryHeader) {
    if (metadata.title) metaLines.push(`# Report Title: ${metadata.title}`);
    if (metadata.query) metaLines.push(`# Executed Query: ${metadata.query}`);
    if (metadata.generatedAt) metaLines.push(`# Generated At: ${metadata.generatedAt}`);
    metaLines.push('');
  }

  // UTF-8 Byte Order Mark (\uFEFF) ensures Excel renders characters properly
  const csvContent =
    '\uFEFF' +
    (metaLines.length > 0 ? metaLines.join('\r\n') + '\r\n' : '') +
    [headerRow, ...dataRows].join('\r\n');
  const targetName = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  downloadFile(csvContent, targetName, 'text/csv;charset=utf-8;');
}

/**
 * Converts array of objects to Microsoft Excel XML Workbook format (.xls/.xlsx compatible)
 * Includes typed cells (Number vs String) and bold header styling.
 */
export function exportToExcel(
  data: any[],
  filename: string,
  metadata?: ExportMetadata | string
): void {
  if (!data || data.length === 0) {
    alert('No data rows to export.');
    return;
  }

  const meta: ExportMetadata =
    typeof metadata === 'string' ? { title: metadata } : metadata || {};
  const title = meta.title || 'Report';
  const columns = Object.keys(data[0]);
  const sheetName = (title || 'Report').substring(0, 31).replace(/[\\/?*[\]]/g, '');

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Author>Apex AI ERP Platform</Author>
  <Created>${new Date().toISOString()}</Created>
 </DocumentProperties>
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Borders/>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#000000"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>
  <Style ss:ID="TitleStyle">
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="13" ss:Color="#1E1B4B" ss:Bold="1"/>
  </Style>
  <Style ss:ID="QueryMeta">
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="9" ss:Color="#64748B" ss:Italic="1"/>
  </Style>
  <Style ss:ID="Header">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#4338CA"/>
   </Borders>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#4F46E5" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="Currency">
   <NumberFormat ss:Format="&quot;₹&quot;#,##0.00"/>
  </Style>
  <Style ss:ID="Integer">
   <NumberFormat ss:Format="#,##0"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="${sheetName}">
  <Table>`;

  // Columns specification
  columns.forEach(() => {
    xml += `\n   <Column ss:AutoFitWidth="1" ss:Width="120"/>`;
  });

  // Optional Query Header inside Excel
  if (meta.includeQueryHeader) {
    xml += `\n   <Row ss:Height="24"><Cell ss:StyleID="TitleStyle"><Data ss:Type="String">${escapeXml(title)}</Data></Cell></Row>`;
    if (meta.query) {
      xml += `\n   <Row ss:Height="18"><Cell ss:StyleID="QueryMeta"><Data ss:Type="String">Query: ${escapeXml(meta.query)}</Data></Cell></Row>`;
    }
    xml += `\n   <Row ss:Height="10"></Row>`; // Empty separator
  }

  // Header Row
  xml += `\n   <Row ss:Height="25">`;
  columns.forEach((col) => {
    const cleanHeader = col
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
    xml += `\n    <Cell ss:StyleID="Header"><Data ss:Type="String">${escapeXml(cleanHeader)}</Data></Cell>`;
  });
  xml += `\n   </Row>`;

  // Data Rows
  data.forEach((row) => {
    xml += `\n   <Row ss:Height="18">`;
    columns.forEach((col) => {
      const val = row[col];
      if (val === null || val === undefined) {
        xml += `\n    <Cell><Data ss:Type="String"></Data></Cell>`;
      } else if (typeof val === 'number') {
        const isMoney =
          col.toLowerCase().includes('amount') ||
          col.toLowerCase().includes('price') ||
          col.toLowerCase().includes('revenue') ||
          col.toLowerCase().includes('total') ||
          col.toLowerCase().includes('salary');
        const style = isMoney ? ' ss:StyleID="Currency"' : ' ss:StyleID="Integer"';
        xml += `\n    <Cell${style}><Data ss:Type="Number">${val}</Data></Cell>`;
      } else if (typeof val === 'boolean') {
        xml += `\n    <Cell><Data ss:Type="String">${val ? 'YES' : 'NO'}</Data></Cell>`;
      } else {
        xml += `\n    <Cell><Data ss:Type="String">${escapeXml(String(val))}</Data></Cell>`;
      }
    });
    xml += `\n   </Row>`;
  });

  xml += `\n  </Table>
 </Worksheet>
</Workbook>`;

  const targetName =
    filename.endsWith('.xls') || filename.endsWith('.xlsx') ? filename : `${filename}.xls`;
  downloadFile(xml, targetName, 'application/vnd.ms-excel;charset=utf-8');
}

/**
 * Converts array of objects to formatted plain-text (TXT) fixed-width table
 */
export function exportToTXT(data: any[], filename: string, metadata?: ExportMetadata): void {
  if (!data || data.length === 0) {
    alert('No data rows to export.');
    return;
  }

  const columns = Object.keys(data[0]);

  // Determine maximum width for each column (minimum 10, max 32)
  const colWidths: Record<string, number> = {};
  columns.forEach((col) => {
    const headerLabel = col.replace(/([A-Z])/g, ' $1').trim();
    let maxLen = headerLabel.length;
    data.forEach((row) => {
      const val = row[col] !== null && row[col] !== undefined ? String(row[col]) : '';
      if (val.length > maxLen) maxLen = val.length;
    });
    colWidths[col] = Math.min(Math.max(maxLen, 10), 32);
  });

  const separator = '+' + columns.map((col) => '-'.repeat(colWidths[col] + 2)).join('+') + '+';

  const formatCell = (text: string, width: number, alignRight = false) => {
    let str = text || '';
    if (str.length > width) {
      str = str.substring(0, width - 3) + '...';
    }
    if (alignRight) {
      return ' ' + str.padStart(width, ' ') + ' ';
    }
    return ' ' + str.padEnd(width, ' ') + ' ';
  };

  const headerCells = columns
    .map((col) => {
      const label = col
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (s) => s.toUpperCase())
        .trim();
      return formatCell(label, colWidths[col]);
    })
    .join('|');

  const rowsText = data.map((row) => {
    const line = columns
      .map((col) => {
        const val = row[col];
        const isNum = typeof val === 'number';
        const strVal =
          val !== null && val !== undefined
            ? isNum
              ? val.toLocaleString('en-IN')
              : String(val)
            : '-';
        return formatCell(strVal, colWidths[col], isNum);
      })
      .join('|');
    return '|' + line + '|';
  });

  let reportText = '';

  // Only include query metadata header if requested
  if (metadata?.includeQueryHeader) {
    const nowStr =
      metadata.generatedAt ||
      new Date().toLocaleString('en-IN', { timeZoneName: 'short' });
    const title = metadata.title || 'ENTERPRISE BUSINESS REPORT';
    const queryStr = metadata.query ? `QUERY: ${metadata.query}` : '';
    const datasetStr = metadata.datasetName
      ? `DATASET: ${metadata.datasetName.toUpperCase()}`
      : '';

    const headerLines = [
      '========================================================================================',
      ` APEX GLOBAL ENTERPRISES - ERP REPORT REQUISITION`,
      ` REPORT TITLE: ${title.toUpperCase()}`,
      ` GENERATED AT: ${nowStr}`,
    ];
    if (datasetStr) headerLines.push(` ${datasetStr}`);
    if (queryStr) headerLines.push(` ${queryStr}`);
    headerLines.push('========================================================================================');
    headerLines.push('');

    reportText = [
      ...headerLines,
      separator,
      '|' + headerCells + '|',
      separator,
      ...rowsText,
      separator,
      '',
      `TOTAL RECORDS EXTRACTED: ${data.length}`,
      'SYSTEM ENGINE: DJANGO REST FRAMEWORK ORM / POSTGRESQL CONNECTOR',
      '========================================================================================',
    ].join('\r\n');
  } else {
    // Pure clean data table
    reportText = [
      separator,
      '|' + headerCells + '|',
      separator,
      ...rowsText,
      separator,
      `TOTAL RECORDS: ${data.length}`,
    ].join('\r\n');
  }

  const targetName = filename.endsWith('.txt') ? filename : `${filename}.txt`;
  downloadFile(reportText, targetName, 'text/plain;charset=utf-8;');
}

/**
 * Converts array of objects to JSON format with optional report metadata
 */
export function exportToJSON(data: any[], filename: string, metadata?: ExportMetadata): void {
  if (!data || data.length === 0) {
    alert('No data rows to export.');
    return;
  }

  let jsonContent = '';
  if (metadata?.includeQueryHeader) {
    const payload = {
      metadata: {
        reportTitle: metadata?.title || 'Custom ERP Report',
        dataset: metadata?.datasetName || 'custom_query',
        generatedAt: metadata?.generatedAt || new Date().toISOString(),
        recordCount: data.length,
        query: metadata?.query || null,
        filters: metadata?.filters || {},
        schemaVersion: '1.0.0',
      },
      data: data,
    };
    jsonContent = JSON.stringify(payload, null, 2);
  } else {
    // Pure clean array of records
    jsonContent = JSON.stringify(data, null, 2);
  }

  const targetName = filename.endsWith('.json') ? filename : `${filename}.json`;
  downloadFile(jsonContent, targetName, 'application/json;charset=utf-8;');
}

/**
 * Native Print view
 */
export function printReportTable(data: any[], title: string, query?: string): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    window.print();
    return;
  }

  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  const html = `<!DOCTYPE html>
<html>
<head>
  <title>${escapeXml(title)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 12px; color: #1e293b; padding: 24px; margin: 0; }
    h1 { font-size: 18px; color: #0f172a; margin: 0 0 4px 0; }
    .meta { font-size: 11px; color: #64748b; margin-bottom: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th { background: #4f46e5; color: #ffffff; text-align: left; padding: 6px 10px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
    td { padding: 6px 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px; }
    tr:nth-child(even) { background-color: #f8fafc; }
    .num { text-align: right; font-family: monospace; }
    .footer { margin-top: 20px; font-size: 10px; color: #94a3b8; text-align: right; }
  </style>
</head>
<body>
  <h1>${escapeXml(title)}</h1>
  <div class="meta">
    Generated on: ${new Date().toLocaleString()} | Total Records: ${data.length}
    ${query ? `<br>Query: <code>${escapeXml(query)}</code>` : ''}
  </div>
  <table>
    <thead>
      <tr>
        ${columns.map((c) => `<th>${escapeXml(c)}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${data
        .map(
          (row) => `
        <tr>
          ${columns
            .map((c) => {
              const val = row[c];
              const isNum = typeof val === 'number';
              const formatted =
                val !== null && val !== undefined
                  ? isNum
                    ? val.toLocaleString('en-IN')
                    : escapeXml(String(val))
                  : '-';
              return `<td class="${isNum ? 'num' : ''}">${formatted}</td>`;
            })
            .join('')}
        </tr>`
        )
        .join('')}
    </tbody>
  </table>
  <div class="footer">Apex AI ERP System • Internal Confidential</div>
</body>
</html>`;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 250);
}

export const printPrescriptionStyles = `
@media print {
  /* Hide all elements on the page by default */
  body * {
    visibility: hidden;
    background-color: transparent !important;
    color-scheme: light !important;
  }
  
  /* Make only the prescription container and its children visible */
  #printable-prescription-area, #printable-prescription-area * {
    visibility: visible;
  }
  
  /* Absolute position the printable area to the top-left of the page */
  #printable-prescription-area {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    margin: 0;
    padding: 0;
    color: #000 !important;
    background: #fff !important;
  }

  /* Define page margins and layout */
  @page {
    size: A4 portrait;
    margin: 12mm 15mm;
  }

  /* Remove scrollbars, headers, footers in browser print defaults where possible */
  body {
    margin: 0 !important;
    padding: 0 !important;
    background-color: #ffffff !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* Remove borders and shadows on cards or papers specifically for print */
  .no-print-border {
    border: none !important;
    box-shadow: none !important;
    background: transparent !important;
  }

  /* Ensure text doesn't overflow pages or split awkwardly */
  h1, h2, h3, h4, h5, h6, p {
    color: #000000 !important;
  }
}
`;

export default printPrescriptionStyles;

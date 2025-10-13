<?php
include '../../db.php';
require_once('../../tcpdf/TCPDF-6.10.0/TCPDF-6.10.0/tcpdf.php');

// ✅ Extend TCPDF to add automatic page footer
class StudentPDF extends TCPDF {
  public function Footer() {
    $this->SetY(-15); // Position 15mm from bottom
    $this->SetFont('helvetica', '', 10);
    $this->Cell(0, 10, 'Page '.$this->getAliasNumPage().' of '.$this->getAliasNbPages(), 0, 0, 'R');
  }
}

// Create new PDF document (Landscape)
$pdf = new StudentPDF('L', 'mm', 'A4', true, 'UTF-8', false);

// Document info
$pdf->SetCreator('PUP System');
$pdf->SetAuthor('PUP System');
$pdf->SetTitle('Student List');
$pdf->SetSubject('Student List');
$pdf->SetMargins(15, 20, 15);
$pdf->SetAutoPageBreak(TRUE, 20);

// Date
$today = date("F d, Y");

// Header HTML
$headerHTML = <<<EOD
<h2 style="text-align:center; color:#800000;">Polytechnic University of the Philippines - Taguig Campus</h2>
<p style="text-align:center;">Date Created: $today</p>
EOD;

// ✅ Table Header (reusable per page)
function getTableHeader() {
  return '
    <table border="1" cellpadding="5" cellspacing="0" width="100%" style="border-collapse:collapse;">
      <tr style="background-color:#800000; color:#ffffff; font-weight:bold; text-align:center;">
        <th width="5%">ID</th>
        <th width="10%">Student No</th>
        <th width="20%">Full Name</th>
        <th width="20%">Email</th>
        <th width="10%">Gender</th>
        <th width="12%">Birthdate</th>
        <th width="8%">Year</th>
        <th width="15%">Program</th>
      </tr>
  ';
}

// Fetch data (exclude soft deleted)
$query = "
  SELECT s.*, p.program_name 
  FROM tbl_student s 
  LEFT JOIN tbl_program p ON s.program_id = p.program_id 
  WHERE s.is_deleted = 0 
  ORDER BY s.student_id ASC
";
$result = $conn->query($query);

// ✅ Add first page
$pdf->AddPage();
$pdf->writeHTML($headerHTML, true, false, true, false, '');
$html = getTableHeader();

$rowCount = 0;
$i = 0;

// ✅ Loop rows, add new page every 7 rows
while ($row = $result->fetch_assoc()) {
  $bg = $i % 2 === 0 ? '#ffffff' : '#f9f9f9';
  $html .= '
    <tr style="background-color:' . $bg . '; font-size:10pt;">
      <td align="center">' . $row['student_id'] . '</td>
      <td align="center">' . htmlspecialchars($row['student_no']) . '</td>
      <td>' . htmlspecialchars($row['student_name']) . '</td>
      <td>' . htmlspecialchars($row['email']) . '</td>
      <td align="center">' . htmlspecialchars($row['gender']) . '</td>
      <td align="center">' . htmlspecialchars($row['birthdate']) . '</td>
      <td align="center">' . htmlspecialchars($row['year_level']) . '</td>
      <td>' . htmlspecialchars($row['program_name']) . '</td>
    </tr>
  ';
  $rowCount++;
  $i++;

  if ($rowCount === 10) {
    $html .= '</table>';
    $pdf->writeHTML($html, true, false, true, false, '');
    // ✅ New page (footer auto-handled)
    $pdf->AddPage();
    $pdf->writeHTML($headerHTML, true, false, true, false, '');
    $html = getTableHeader();
    $rowCount = 0;
  }
}

// ✅ Close last table
if ($rowCount > 0) {
  $html .= '</table>';
  $pdf->writeHTML($html, true, false, true, false, '');
}

// ✅ Output PDF
$pdf->Output('students.pdf', 'I');

$conn->close();
?>

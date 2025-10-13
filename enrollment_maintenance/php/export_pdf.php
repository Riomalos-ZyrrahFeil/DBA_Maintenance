<?php
include '../../db.php';
require_once('../../tcpdf/TCPDF-6.10.0/TCPDF-6.10.0/tcpdf.php'); // Adjust path if needed

// Create new PDF document
$pdf = new TCPDF('L', 'mm', 'A4', true, 'UTF-8', false);

// Document information
$pdf->SetCreator('PUP System');
$pdf->SetAuthor('PUP System');
$pdf->SetTitle('Enrollment List');
$pdf->SetSubject('Enrollment List');

// Layout settings
$pdf->SetMargins(15, 20, 15);
$pdf->SetAutoPageBreak(TRUE, 20);
$pdf->AddPage();

$today = date("F d, Y");

// Header
$header = <<<EOD
<h2 style="text-align:center; color:#800000;">Polytechnic University of the Philippines - Taguig Campus</h2>
<p style="text-align:center;">Date Created: $today</p>
EOD;

$pdf->writeHTML($header, true, false, true, false, '');

// Table Header
$html = '<table border="1" cellpadding="4" cellspacing="0" style="border-collapse: collapse; width: 100%;">';
$html .= '<tr style="background-color:#800000; color:#ffffff; font-weight:bold;">
            <th>Enrollment ID</th>
            <th>Student ID</th>
            <th>Section ID</th>
            <th>Date Enrolled</th>
            <th>Status</th>
            <th>Letter Grade</th>
          </tr>';

// Fetch data
$result = $conn->query("SELECT * FROM tbl_enrollment WHERE is_deleted = 0 ORDER BY enrollment_id DESC");

$i = 0;
while ($row = $result->fetch_assoc()) {
    $bg = $i % 2 === 0 ? '#ffffff' : '#f9f9f9';
    $html .= '<tr style="background-color:' . $bg . ';">
                <td>' . $row['enrollment_id'] . '</td>
                <td>' . $row['student_id'] . '</td>
                <td>' . $row['section_id'] . '</td>
                <td>' . $row['date_enrolled'] . '</td>
                <td>' . $row['status'] . '</td>
                <td>' . $row['letter_grade'] . '</td>
              </tr>';
    $i++;
}

$html .= '</table>';

// Write table to PDF
$pdf->writeHTML($html, true, false, true, false, '');

// Footer
$pdf->SetY(-30);
$pdf->SetFont('helvetica', '', 10);
$pdf->Cell(0, 10, "Printed on: $today | Page ".$pdf->getAliasNumPage()." of ".$pdf->getAliasNbPages(), 0, false, 'R');

// Output PDF
$pdf->Output('enrollments.pdf', 'I');

$conn->close();
?>

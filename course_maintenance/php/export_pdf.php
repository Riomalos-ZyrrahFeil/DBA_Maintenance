<?php
include '../../db.php';
require_once('../../tcpdf/TCPDF-6.10.0/TCPDF-6.10.0/tcpdf.php');

$pdf = new TCPDF('P', 'mm', 'A4', true, 'UTF-8', false);

$pdf->SetCreator('PUP System');
$pdf->SetAuthor('PUP System');
$pdf->SetTitle('Course List');
$pdf->SetSubject('Course List');

$pdf->SetMargins(15, 20, 15);
$pdf->SetAutoPageBreak(TRUE, 20);
$pdf->AddPage();

// University Header
$today = date("F d, Y");
$header = <<<EOD
<h2 style="text-align:center; color:#800000;">Polytechnic University of the Philippines - Taguig Campus</h2>
<p style="text-align:center;">Date Created: $today</p>
EOD;

$pdf->writeHTML($header, true, false, true, false, '');

// Table header
$html = '<table border="1" cellpadding="4" cellspacing="0" style="border-collapse: collapse; width: 100%;">';
$html .= '<tr style="background-color:#800000; color:#ffffff; font-weight:bold; text-align:center;">
            <th width="7%">ID</th>
            <th width="15%">Code</th>
            <th width="44%">Title</th>
            <th width="15%">Lecture</th>
            <th width="10%">Lab</th>
            <th width="10%">Units</th>
          </tr>';

// Fetch course data
$result = $conn->query("SELECT * FROM tbl_course WHERE is_deleted = 0 ORDER BY course_id ASC");
$i = 0;

while ($row = $result->fetch_assoc()) {
    $bg = $i % 2 === 0 ? '#ffffff' : '#f9f9f9';
    $html .= '<tr style="background-color:' . $bg . '; text-align:left;">
                <td>' . $row['course_id'] . '</td>
                <td>' . $row['course_code'] . '</td>
                <td>' . htmlspecialchars($row['title']) . '</td>
                <td>' . $row['lecture_hours'] . '</td>
                <td>' . $row['lab_hours'] . '</td>
                <td>' . $row['units'] . '</td>
              </tr>';
    $i++;
}

$html .= '</table>';

// Output table
$pdf->writeHTML($html, true, false, true, false, '');

// Footer
$pdf->SetY(-30);
$pdf->SetFont('helvetica', '', 10);
$pdf->Cell(0, 10, "Printed on: $today | Page ".$pdf->getAliasNumPage()." of ".$pdf->getAliasNbPages(), 0, false, 'R');

// Close connection
$conn->close();

// Output PDF
$pdf->Output('courses.pdf', 'I');
?>

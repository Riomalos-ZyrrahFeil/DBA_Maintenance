<?php
include '../../db.php';
require_once('../../tcpdf/TCPDF-6.10.0/TCPDF-6.10.0/tcpdf.php');

$pdf = new TCPDF('P', 'mm', 'A4', true, 'UTF-8', false);

// Set document information
$pdf->SetCreator('PUP System');
$pdf->SetAuthor('PUP System');
$pdf->SetTitle('Department List');
$pdf->SetSubject('Department List');
$pdf->SetMargins(15, 20, 15);
$pdf->SetAutoPageBreak(TRUE, 20);
$pdf->AddPage();

// University header
$today = date("F d, Y");
$header = <<<EOD
<h2 style="text-align:center; color:#800000;">Polytechnic University of the Philippines - Taguig Campus</h2>
<p style="text-align:center;">Date Created: $today</p>
EOD;

$pdf->writeHTML($header, true, false, true, false, '');

// Table header
$html = '<table border="1" cellpadding="4" cellspacing="0" style="border-collapse: collapse; width: 100%;">';
$html .= '<tr style="background-color:#800000; color:#ffffff; font-weight:bold;">
            <th>ID</th>
            <th>Department Code</th>
            <th>Department Name</th>
          </tr>';

// Fetch data
$result = $conn->query("SELECT * FROM tbl_department WHERE is_deleted=0 ORDER BY dept_id ASC");
$i = 0;
while ($row = $result->fetch_assoc()) {
    $bg = $i % 2 === 0 ? '#ffffff' : '#f9f9f9';
    $html .= '<tr style="background-color:' . $bg . ';">
                <td>' . $row['dept_id'] . '</td>
                <td>' . $row['dept_code'] . '</td>
                <td>' . $row['dept_name'] . '</td>
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

// Close and output PDF
$pdf->Output('departments.pdf', 'I');

$conn->close();
?>

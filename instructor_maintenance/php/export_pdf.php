<?php
include '../../db.php';
require_once('../../tcpdf/TCPDF-6.10.0/TCPDF-6.10.0/tcpdf.php'); // Adjust path if needed

// Create new PDF document
$pdf = new TCPDF('P', 'mm', 'A4', true, 'UTF-8', false);

// Document info
$pdf->SetCreator('PUP System');
$pdf->SetAuthor('PUP System');
$pdf->SetTitle('Instructor List');
$pdf->SetSubject('Instructor List');

// Margins and auto page break
$pdf->SetMargins(15, 20, 15);
$pdf->SetAutoPageBreak(TRUE, 20);
$pdf->AddPage();

// Header
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
            <th>Full Name</th>
            <th>Email</th>
            <th>Department</th>
          </tr>';

// Fetch instructors (only not deleted)
$result = $conn->query("
    SELECT i.instructor_id, CONCAT(i.first_name,' ',i.last_name) AS full_name, i.email, d.dept_name
    FROM tbl_instructor i
    LEFT JOIN tbl_department d ON i.dept_id = d.dept_id
    WHERE i.is_deleted=0
    ORDER BY i.instructor_id ASC
");

$i = 0;
while ($row = $result->fetch_assoc()) {
    $bg = $i % 2 === 0 ? '#ffffff' : '#f9f9f9';
    $html .= '<tr style="background-color:' . $bg . ';">
                <td>' . $row['instructor_id'] . '</td>
                <td>' . $row['full_name'] . '</td>
                <td>' . $row['email'] . '</td>
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

// Output PDF to browser (I = inline view, D = download)
$pdf->Output('instructors.pdf', 'I');

$conn->close();
?>

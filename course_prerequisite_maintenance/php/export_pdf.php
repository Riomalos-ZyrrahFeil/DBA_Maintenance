<?php
include '../../db.php';
require_once('../../tcpdf/TCPDF-6.10.0/TCPDF-6.10.0/tcpdf.php');

$pdf = new TCPDF('L', 'mm', 'A4', true, 'UTF-8', false); 

$pdf->SetCreator('PUP System');
$pdf->SetAuthor('PUP System');
$pdf->SetTitle('Course Prerequisite List');
$pdf->SetSubject('Course Prerequisite List');

$pdf->SetMargins(15, 20, 15);
$pdf->SetAutoPageBreak(TRUE, 20);
$pdf->AddPage();

$today = date("F d, Y");
$header = <<<EOD
<h2 style="text-align:center; color:#800000;">Polytechnic University of the Philippines - Taguig Campus</h2>
<h3 style="text-align:center;">Course Prerequisite List</h3>
<p style="text-align:center;">Date Created: $today</p>
EOD;

$pdf->writeHTML($header, true, false, true, false, '');

$html = '<table border="1" cellpadding="4" cellspacing="0" style="border-collapse: collapse; width: 100%;">';
$html .= '<tr style="background-color:#800000; color:#ffffff; font-weight:bold; text-align:center;">
            <th width="8%">Prereq ID</th>
            <th width="15%">Course Code</th>
            <th width="32%">Course Title</th> 
            <th width="15%">Prerequisite Code</th>
            <th width="30%">Prerequisite Name</th> 
          </tr>';

$query = "
    SELECT 
        cp.prerequisite_id,
        c1.course_code AS course_code,
        c1.title AS course_title,
        c2.course_code AS prerequisite_code,
        c2.title AS prerequisite_title
    FROM tbl_course_prerequisite cp
    INNER JOIN tbl_course c1 ON cp.course_id = c1.course_id
    INNER JOIN tbl_course c2 ON cp.prereq_course_id = c2.course_id
    WHERE c1.is_deleted = 0 
      AND c2.is_deleted = 0 
      AND cp.is_deleted = 0 
    ORDER BY c1.course_code ASC, c2.course_code ASC
";

$result = $conn->query($query);
$i = 0;

while ($row = $result->fetch_assoc()) {
    $bg = $i % 2 === 0 ? '#ffffff' : '#f9f9f9';
    $html .= '<tr style="background-color:' . $bg . '; text-align:left;">
                <td width="8%" style="text-align:center;">' . $row['prerequisite_id'] . '</td>
                <td width="15%" style="text-align:center;">' . $row['course_code'] . '</td>
                <td width="32%">' . htmlspecialchars($row['course_title']) . '</td>
                <td width="15%" style="text-align:center;">' . $row['prerequisite_code'] . '</td>
                <td width="30%">' . htmlspecialchars($row['prerequisite_title']) . '</td>
              </tr>';
    $i++;
}

$html .= '</table>';

$pdf->writeHTML($html, true, false, true, false, '');

$pdf->SetY(-30);
$pdf->SetFont('helvetica', '', 10);
$pdf->Cell(0, 10, "Printed on: $today | Page ".$pdf->getAliasNumPage()." of ".$pdf->getAliasNbPages(), 0, false, 'R');

$conn->close();

$pdf->Output('course_prerequisites.pdf', 'I');
?>
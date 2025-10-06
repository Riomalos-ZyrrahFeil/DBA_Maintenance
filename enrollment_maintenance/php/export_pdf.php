<?php
include '../../db.php';
require_once('tcpdf_min/tcpdf.php'); // adjust path if needed

$pdf = new TCPDF();
$pdf->AddPage();
$pdf->SetFont('helvetica', '', 12);

$html = '<h2>Enrollment List</h2>
<table border="1" cellpadding="5">
<tr>
<th>Enrollment ID</th>
<th>Student ID</th>
<th>Section ID</th>
<th>Date Enrolled</th>
<th>Status</th>
<th>Letter Grade</th>
</tr>';

$result = $conn->query("SELECT * FROM tbl_enrollment ORDER BY enrollment_id DESC");

while ($row = $result->fetch_assoc()) {
    $html .= '<tr>
        <td>'.$row['enrollment_id'].'</td>
        <td>'.$row['student_id'].'</td>
        <td>'.$row['section_id'].'</td>
        <td>'.$row['date_enrolled'].'</td>
        <td>'.$row['status'].'</td>
        <td>'.$row['letter_grade'].'</td>
    </tr>';
}

$html .= '</table>';

$pdf->writeHTML($html);
$pdf->Output('enrollments.pdf', 'D');
?>

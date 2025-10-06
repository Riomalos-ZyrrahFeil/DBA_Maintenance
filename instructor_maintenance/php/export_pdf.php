<?php
include '../../db.php';
require_once('tcpdf_min/tcpdf.php'); // Make sure TCPDF is installed

$pdf = new TCPDF();
$pdf->AddPage();
$pdf->SetFont('helvetica', '', 12);

$html = '<h2>Instructor List</h2><table border="1" cellpadding="4">
<tr><th>ID</th><th>Full Name</th><th>Email</th><th>Department</th></tr>';

$sql = "SELECT i.instructor_id, CONCAT(i.first_name,' ',i.last_name) as full_name, i.email, d.dept_name 
        FROM tbl_instructor i 
        LEFT JOIN tbl_department d ON i.dept_id = d.dept_id";
$res = $conn->query($sql);

while($row = $res->fetch_assoc()){
    $html .= '<tr>
        <td>'.$row['instructor_id'].'</td>
        <td>'.$row['full_name'].'</td>
        <td>'.$row['email'].'</td>
        <td>'.$row['dept_name'].'</td>
    </tr>';
}

$html .= '</table>';
$pdf->writeHTML($html, true, false, true, false, '');
$pdf->Output('instructors.pdf', 'D');
?>

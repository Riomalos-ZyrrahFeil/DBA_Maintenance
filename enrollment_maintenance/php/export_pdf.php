<?php
session_start();
include '../../db.php';
require_once('../../tcpdf/TCPDF-6.10.0/TCPDF-6.10.0/tcpdf.php'); 

$user_role = $_SESSION['role'] ?? '';
$student_session_id = $_SESSION['student_id'] ?? 0;
$requested_id = isset($_GET['student_id']) ? $_GET['student_id'] : 'all';

$student_id = ($user_role === 'student') ? $student_session_id : $requested_id;

$pdf = new TCPDF('L', 'mm', 'A4', true, 'UTF-8', false);
$pdf->SetCreator('PUP System');
$pdf->SetTitle('Enrollment List');
$pdf->SetMargins(15, 20, 15);
$pdf->SetAutoPageBreak(TRUE, 20);
$pdf->AddPage();

$today = date("F d, Y");

$titleText = "Polytechnic University of the Philippines - Taguig Campus";
$subTitle = "Full Enrollment Report";

if ($student_id !== 'all') {
    $nameRes = $conn->query("SELECT student_name FROM tbl_student WHERE student_id = " . intval($student_id));
    $studentData = $nameRes->fetch_assoc();
    $subTitle = "Enrollment Record: " . ($studentData['student_name'] ?? "Unknown Student");
}

$header = <<<EOD
<h2 style="text-align:center; color:#800000;">$titleText</h2>
<h3 style="text-align:center;">$subTitle</h3>
<p style="text-align:center;">Date Created: $today</p>
EOD;
$pdf->writeHTML($header, true, false, true, false, '');

$html = '<table border="1" cellpadding="4" cellspacing="0" style="border-collapse: collapse; width: 100%;">';
$html .= '<tr style="background-color:#800000; color:#ffffff; font-weight:bold;">
            <th width="10%">ID</th><th width="30%">Student Name</th><th width="20%">Section Code</th>
            <th width="15%">Date Enrolled</th><th width="15%">Status</th><th width="10%">Grade</th>
          </tr>';

// 3. Identification Filter SQL
$sql = "SELECT e.enrollment_id, s.student_name, sec.section_code, e.date_enrolled, e.status, e.letter_grade 
        FROM tbl_enrollment e
        JOIN tbl_student s ON e.student_id = s.student_id
        JOIN tbl_section sec ON e.section_id = sec.section_id
        WHERE e.is_deleted = 0";

if ($student_id !== 'all') {
    $sql .= " AND e.student_id = " . intval($student_id);
}

$sql .= " ORDER BY e.enrollment_id DESC";
$result = $conn->query($sql);

$i = 0;
while ($row = $result->fetch_assoc()) {
    $bg = $i % 2 === 0 ? '#ffffff' : '#f9f9f9';
    $html .= '<tr style="background-color:' . $bg . ';">
                <td>' . $row['enrollment_id'] . '</td><td>' . $row['student_name'] . '</td>
                <td>' . $row['section_code'] . '</td><td>' . $row['date_enrolled'] . '</td>
                <td>' . $row['status'] . '</td><td>' . $row['letter_grade'] . '</td>
              </tr>';
    $i++;
}
$html .= '</table>';
$pdf->writeHTML($html, true, false, true, false, '');

$pdf->SetY(-30);
$pdf->SetFont('helvetica', '', 10);
$pdf->Cell(0, 10, "Printed on: $today | Page ".$pdf->getAliasNumPage()." of ".$pdf->getAliasNbPages(), 0, false, 'R');

$pdf->Output('enrollments.pdf', 'I');
$conn->close();
?>
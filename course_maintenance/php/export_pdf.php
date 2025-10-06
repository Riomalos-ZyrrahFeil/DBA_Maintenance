<?php
include '../../db.php';
require('../../fpdf/fpdf.php'); // Make sure FPDF is included

$pdf = new FPDF();
$pdf->AddPage();
$pdf->SetFont('Arial', 'B', 12);

$pdf->Cell(20, 10, 'ID', 1);
$pdf->Cell(30, 10, 'Code', 1);
$pdf->Cell(60, 10, 'Title', 1);
$pdf->Cell(25, 10, 'Lecture', 1);
$pdf->Cell(25, 10, 'Lab', 1);
$pdf->Cell(20, 10, 'Units', 1);
$pdf->Ln();

$result = $conn->query("SELECT * FROM tbl_course ORDER BY course_id DESC");

$pdf->SetFont('Arial', '', 12);
while ($row = $result->fetch_assoc()) {
    $pdf->Cell(20, 10, $row['course_id'], 1);
    $pdf->Cell(30, 10, $row['course_code'], 1);
    $pdf->Cell(60, 10, $row['title'], 1);
    $pdf->Cell(25, 10, $row['lecture_hours'], 1);
    $pdf->Cell(25, 10, $row['lab_hours'], 1);
    $pdf->Cell(20, 10, $row['units'], 1);
    $pdf->Ln();
}

$pdf->Output('D', 'courses.pdf');
?>

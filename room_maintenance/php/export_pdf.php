<?php
include '../../db.php';
require('fpdf.php');

$pdf = new FPDF();
$pdf->AddPage();
$pdf->SetFont('Arial','B',12);
$pdf->Cell(0,10,'Room List',0,1,'C');

$pdf->SetFont('Arial','',10);
$pdf->Cell(20,10,'ID',1);
$pdf->Cell(50,10,'Room Code',1);
$pdf->Cell(30,10,'Capacity',1);
$pdf->Cell(50,10,'Building',1);
$pdf->Ln();

$sql = "SELECT * FROM tbl_room";
$result = $conn->query($sql);
while($row = $result->fetch_assoc()) {
    $pdf->Cell(20,10,$row['room_id'],1);
    $pdf->Cell(50,10,$row['room_code'],1);
    $pdf->Cell(30,10,$row['capacity'],1);
    $pdf->Cell(50,10,$row['building'],1);
    $pdf->Ln();
}
$pdf->Output();
?>

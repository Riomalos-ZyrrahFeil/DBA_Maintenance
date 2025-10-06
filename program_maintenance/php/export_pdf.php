<?php
require('../../fpdf/fpdf.php');
include '../../db.php';

class PDF extends FPDF {
  function Header() {
    $this->SetFont('Arial','B',14);
    $this->Cell(0,10,'Program List',0,1,'C');
    $this->Ln(5);
  }
}

$pdf = new PDF();
$pdf->AddPage();
$pdf->SetFont('Arial','B',12);
$pdf->Cell(20,10,'ID',1);
$pdf->Cell(40,10,'Code',1);
$pdf->Cell(70,10,'Name',1);
$pdf->Cell(50,10,'Department',1);
$pdf->Ln();

$pdf->SetFont('Arial','',11);
$sql = "SELECT p.program_id, p.program_code, p.program_name, d.dept_name 
        FROM tbl_program p
        JOIN tbl_department d ON p.dept_id = d.dept_id";
$result = $conn->query($sql);

while ($row = $result->fetch_assoc()) {
  $pdf->Cell(20,10,$row['program_id'],1);
  $pdf->Cell(40,10,$row['program_code'],1);
  $pdf->Cell(70,10,$row['program_name'],1);
  $pdf->Cell(50,10,$row['dept_name'],1);
  $pdf->Ln();
}

$pdf->Output();
$conn->close();
?>

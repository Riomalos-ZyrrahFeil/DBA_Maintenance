<?php
require('fpdf/fpdf.php');
include '../../db.php';


class PDF extends FPDF {
  function Header() {
    $this->SetFont('Arial','B',14);
    $this->Cell(0,10,'Student List',0,1,'C');
    $this->Ln(5);
  }
}

$pdf = new PDF();
$pdf->AddPage();
$pdf->SetFont('Arial','',12);

$result = $conn->query("SELECT * FROM tbl_student");
while($row = $result->fetch_assoc()) {
  $pdf->Cell(0,10, "{$row['student_id']} - {$row['student_name']} ({$row['email']})", 0, 1);
}

$pdf->Output();
?>

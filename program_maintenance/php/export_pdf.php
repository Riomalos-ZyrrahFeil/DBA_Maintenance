<?php
include '../../db.php';
require_once('../../tcpdf/TCPDF-6.10.0/TCPDF-6.10.0/tcpdf.php'); // adjust path if needed

// Extend TCPDF to customize Footer
class PDF extends TCPDF {
    public function Footer() {
        $this->SetY(-15);
        $this->SetFont('helvetica', '', 10);
        $today = date("F d, Y");
        $this->Cell(0, 10, "Printed on: $today | Page ".$this->getAliasNumPage()." of ".$this->getAliasNbPages(), 0, false, 'R');
    }
}

$pdf = new PDF('P', 'mm', 'A4', true, 'UTF-8', false);
$pdf->SetCreator('PUP System');
$pdf->SetAuthor('PUP System');
$pdf->SetTitle('Program List');
$pdf->SetSubject('Program List');
$pdf->SetMargins(15, 20, 15);
$pdf->SetAutoPageBreak(TRUE, 25); // leave space for footer
$pdf->AddPage();

// University header function
function addUniversityHeader($pdf) {
    $today = date("F d, Y");
    $header = <<<EOD
<h2 style="text-align:center; color:#800000;">Polytechnic University of the Philippines - Taguig Campus</h2>
<p style="text-align:center;">Date Created: $today</p>
EOD;
    $pdf->writeHTML($header, true, false, true, false, '');
}

// Table header function
function addTableHeader(&$html) {
    $html .= '<table border="1" cellpadding="4" cellspacing="0" style="border-collapse: collapse; width: 100%;">';
    $html .= '<tr style="background-color:#800000; color:#ffffff; font-weight:bold;">
                <th>ID</th>
                <th>Program Code</th>
                <th>Program Name</th>
                <th>Department</th>
              </tr>';
}

// Fetch only non-deleted programs
$result = $conn->query("SELECT p.program_id, p.program_code, p.program_name, d.dept_name 
                        FROM tbl_program p
                        JOIN tbl_department d ON p.dept_id = d.dept_id
                        WHERE p.is_deleted=0
                        ORDER BY p.program_id ASC");

$i = 0;
$rowsPerPage = 9;
$html = '';
addTableHeader($html);
addUniversityHeader($pdf);

while ($row = $result->fetch_assoc()) {
    $bg = $i % 2 === 0 ? '#ffffff' : '#f9f9f9';
    $html .= '<tr style="background-color:' . $bg . '; text-align:left;">
                <td>' . $row['program_id'] . '</td>
                <td>' . $row['program_code'] . '</td>
                <td>' . $row['program_name'] . '</td>
                <td>' . $row['dept_name'] . '</td>
              </tr>';
    $i++;

    // Every 9 rows, close table, write HTML, add new page, reset HTML
    if ($i % $rowsPerPage === 0) {
        $html .= '</table>';
        $pdf->writeHTML($html, true, false, true, false, '');
        $pdf->AddPage();
        addUniversityHeader($pdf);
        $html = '';
        addTableHeader($html);
    }
}

// Write remaining rows if any
if ($i % $rowsPerPage !== 0) {
    $html .= '</table>';
    $pdf->writeHTML($html, true, false, true, false, '');
}

$pdf->Output('programs.pdf', 'I');
$conn->close();
?>

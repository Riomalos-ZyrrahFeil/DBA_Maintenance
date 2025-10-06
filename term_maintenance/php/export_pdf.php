<?php
include '../../db.php';
require_once '../../vendor/autoload.php'; // Make sure TCPDF is installed

$pdf = new \TCPDF();
$pdf->AddPage();
$pdf->SetFont('helvetica', '', 12);

$html = '<h2>Term List</h2><table border="1" cellpadding="5"><tr><th>Term ID</th><th>Term Code</th><th>Start Date</th><th>End Date</th></tr>';

$result = $conn->query("SELECT * FROM tbl_term");
while($row = $result->fetch_assoc()){
    $html .= '<tr>
                <td>'.$row['term_id'].'</td>
                <td>'.$row['term_code'].'</td>
                <td>'.$row['start_date'].'</td>
                <td>'.$row['end_date'].'</td>
              </tr>';
}

$html .= '</table>';
$pdf->writeHTML($html, true, false, true, false, '');
$pdf->Output('terms.pdf', 'D');
?>

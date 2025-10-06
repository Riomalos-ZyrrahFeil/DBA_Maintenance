<?php
include '../../db.php';
require('../../vendor/autoload.php'); // assuming you have TCPDF installed via composer

use TCPDF;

$pdf = new TCPDF();
$pdf->AddPage();
$pdf->SetFont('helvetica', '', 10);

$html = '<h2>Section List</h2><table border="1" cellpadding="5">
<tr>
<th>Section ID</th>
<th>Course ID</th>
<th>Term ID</th>
<th>Instructor ID</th>
<th>Room ID</th>
<th>Section Code</th>
<th>Year</th>
<th>Day Pattern</th>
<th>Start Time</th>
<th>End Time</th>
<th>Max Capacity</th>
</tr>';

$sql = "SELECT * FROM tbl_section";
$result = $conn->query($sql);

if($result->num_rows > 0){
    while($row = $result->fetch_assoc()){
        $html .= "<tr>
            <td>{$row['section_id']}</td>
            <td>{$row['course_id']}</td>
            <td>{$row['term_id']}</td>
            <td>{$row['instructor_id']}</td>
            <td>{$row['room_id']}</td>
            <td>{$row['section_code']}</td>
            <td>{$row['year']}</td>
            <td>{$row['day_pattern']}</td>
            <td>{$row['start_time']}</td>
            <td>{$row['end_time']}</td>
            <td>{$row['max_capacity']}</td>
        </tr>";
    }
}

$html .= '</table>';

$pdf->writeHTML($html, true, false, true, false, '');
$pdf->Output('sections.pdf', 'D');

$conn->close();
?>

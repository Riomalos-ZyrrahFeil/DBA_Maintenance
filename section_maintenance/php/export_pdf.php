<?php
include '../../db.php';
require_once('../../tcpdf/TCPDF-6.10.0/TCPDF-6.10.0/tcpdf.php'); // Adjust path if needed

// Create new PDF document in Landscape
$pdf = new TCPDF('L', 'mm', 'A4', true, 'UTF-8', false);

// Document info
$pdf->SetCreator('PUP System');
$pdf->SetAuthor('PUP System');
$pdf->SetTitle('Section List');
$pdf->SetSubject('Section List');
$pdf->SetMargins(15, 20, 15);
$pdf->SetAutoPageBreak(TRUE, 20);
$pdf->AddPage();

// University header
$today = date("F d, Y");
$header = <<<EOD
<h2 style="text-align:center; color:#800000;">Polytechnic University of the Philippines - Taguig Campus</h2>
<p style="text-align:center;">Date Created: $today</p>
EOD;

$pdf->writeHTML($header, true, false, true, false, '');

// Table header
$html = '<table border="1" cellpadding="4" cellspacing="0" style="border-collapse: collapse; width: 100%;">';
$html .= '<tr style="background-color:#800000; color:#ffffff; font-weight:bold; text-align:center;">
            <th>ID</th>
            <th>Course</th>
            <th>Term</th>
            <th>Instructor</th>
            <th>Room</th>
            <th>Section Code</th>
            <th>Year</th>
            <th>Day Pattern</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Max Capacity</th>
          </tr>';

// Fetch sections (exclude soft deleted)
$result = $conn->query("SELECT s.section_id,
                               c.course_code,
                               t.term_code,
                               CONCAT(i.last_name, ', ', i.first_name) AS instructor_name,
                               CONCAT(r.room_code, ' - ', r.building) AS room_name,
                               s.section_code,
                               s.year,
                               s.day_pattern,
                               s.start_time,
                               s.end_time,
                               s.max_capacity
                        FROM tbl_section s
                        LEFT JOIN tbl_course c ON s.course_id = c.course_id
                        LEFT JOIN tbl_term t ON s.term_id = t.term_id
                        LEFT JOIN tbl_instructor i ON s.instructor_id = i.instructor_id
                        LEFT JOIN tbl_room r ON s.room_id = r.room_id
                        WHERE s.is_deleted = 0
                        ORDER BY s.section_id ASC");

$i = 0;
while ($row = $result->fetch_assoc()) {
    $bg = $i % 2 === 0 ? '#ffffff' : '#f9f9f9';
    $html .= '<tr style="background-color:' . $bg . '; text-align:center;">
                <td>' . $row['section_id'] . '</td>
                <td>' . $row['course_code'] . '</td>
                <td>' . $row['term_code'] . '</td>
                <td>' . $row['instructor_name'] . '</td>
                <td>' . $row['room_name'] . '</td>
                <td>' . $row['section_code'] . '</td>
                <td>' . $row['year'] . '</td>
                <td>' . $row['day_pattern'] . '</td>
                <td>' . $row['start_time'] . '</td>
                <td>' . $row['end_time'] . '</td>
                <td>' . $row['max_capacity'] . '</td>
              </tr>';
    $i++;
}

$html .= '</table>';

// Output table
$pdf->writeHTML($html, true, false, true, false, '');

// Footer
$pdf->SetY(-30);
$pdf->SetFont('helvetica', '', 10);
$pdf->Cell(0, 10, "Printed on: $today | Page ".$pdf->getAliasNumPage()." of ".$pdf->getAliasNbPages(), 0, false, 'R');

// Close and output PDF
$pdf->Output('sections.pdf', 'I');

$conn->close();
?>

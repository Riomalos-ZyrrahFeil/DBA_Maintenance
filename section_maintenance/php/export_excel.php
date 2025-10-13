<?php
include '../../db.php';

header("Content-Type: application/vnd.ms-excel");
header("Content-Disposition: attachment; filename=sections.xls");

$today = date("F d, Y");

// Start table
echo '<table border="1" style="width:100%; border-collapse: collapse; font-family: Poppins, sans-serif;">';

// University header
echo '<tr>
        <td colspan="11" style="font-size:16px; font-weight:bold; text-align:center; background-color:#800000; color:#fff;">
          Polytechnic University of the Philippines - Taguig Campus
        </td>
      </tr>';
echo '<tr>
        <td colspan="11" style="font-size:12px; text-align:center;">Date Created: '.$today.'</td>
      </tr>';
echo '<tr><td colspan="11">&nbsp;</td></tr>';

// Table header
echo '<tr style="background-color:#800000; color:#fff; font-weight:bold; text-align:center;">
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

// Fetch data (exclude soft deleted)
$sql = "SELECT s.section_id,
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
        ORDER BY s.section_id ASC";

$result = $conn->query($sql);

$i = 0;
while($row = $result->fetch_assoc()){
    $bg = $i % 2 === 0 ? '#ffffff' : '#f9f9f9';
    echo '<tr style="background-color: '.$bg.'; text-align:center;">
            <td>'.$row['section_id'].'</td>
            <td>'.$row['course_code'].'</td>
            <td>'.$row['term_code'].'</td>
            <td>'.$row['instructor_name'].'</td>
            <td>'.$row['room_name'].'</td>
            <td>'.$row['section_code'].'</td>
            <td>'.$row['year'].'</td>
            <td>'.$row['day_pattern'].'</td>
            <td>'.$row['start_time'].'</td>
            <td>'.$row['end_time'].'</td>
            <td>'.$row['max_capacity'].'</td>
          </tr>';
    $i++;
}

// Footer
echo '<tr><td colspan="11">&nbsp;</td></tr>';
echo '<tr>
        <td colspan="11" style="font-size:10px; text-align:right;">Printed on: '.$today.' | Page 1 of 1</td>
      </tr>';

echo '</table>';
$conn->close();
?>

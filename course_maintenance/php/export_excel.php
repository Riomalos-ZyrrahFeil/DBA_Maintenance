<?php
include '../../db.php';
header("Content-Type: application/vnd.ms-excel");
header("Content-Disposition: attachment; filename=courses.xls");

$today = date("F d, Y");

// Start table
echo '<table border="1" style="width:100%; border-collapse: collapse; font-family: Poppins, sans-serif;">';

// University header
echo '<tr>
        <td colspan="6" style="font-size:16px; font-weight:bold; text-align:center; background-color:#800000; color:#fff;">
            Polytechnic University of the Philippines - Taguig Campus
        </td>
      </tr>';
echo '<tr>
        <td colspan="6" style="font-size:12px; text-align:center;">
            Date Created: '.$today.'
        </td>
      </tr>';
echo '<tr><td colspan="6">&nbsp;</td></tr>';

// Table header
echo '<tr>
        <th style="background-color:#800000; color:#fff; font-weight:bold; text-align:center;">Course ID</th>
        <th style="background-color:#800000; color:#fff; font-weight:bold; text-align:center;">Course Code</th>
        <th style="background-color:#800000; color:#fff; font-weight:bold; text-align:center;">Title</th>
        <th style="background-color:#800000; color:#fff; font-weight:bold; text-align:center;">Lecture Hours</th>
        <th style="background-color:#800000; color:#fff; font-weight:bold; text-align:center;">Lab Hours</th>
        <th style="background-color:#800000; color:#fff; font-weight:bold; text-align:center;">Units</th>
      </tr>';

// Fetch courses
$result = $conn->query("SELECT * FROM tbl_course WHERE is_deleted = 0 ORDER BY course_id ASC");
$i = 0;

while ($row = $result->fetch_assoc()) {
    $bg = $i % 2 === 0 ? '#ffffff' : '#f9f9f9';
    echo '<tr style="background-color: '.$bg.'; text-align:center;">
            <td>'.$row['course_id'].'</td>
            <td>'.$row['course_code'].'</td>
            <td>'.$row['title'].'</td>
            <td>'.$row['lecture_hours'].'</td>
            <td>'.$row['lab_hours'].'</td>
            <td>'.$row['units'].'</td>
          </tr>';
    $i++;
}

// Footer
echo '<tr><td colspan="6">&nbsp;</td></tr>';
echo '<tr>
        <td colspan="6" style="font-size:10px; text-align:right;">
            Printed on: '.$today.' | Page 1 of 1
        </td>
      </tr>';

echo '</table>';

$conn->close();
?>

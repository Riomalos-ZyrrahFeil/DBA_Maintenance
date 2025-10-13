<?php
include '../../db.php';
header("Content-Type: application/vnd.ms-excel");
header("Content-Disposition: attachment; filename=enrollments.xls");

$today = date("F d, Y");

// Start table
echo '<table border="1" style="width:100%; border-collapse: collapse; font-family: Poppins, sans-serif;">';

// University Header
echo '<tr>
        <td colspan="6" style="font-size:16px; font-weight:bold; text-align:center; background-color:#800000; color:#fff;">
            Polytechnic University of the Philippines - Taguig Campus
        </td>
      </tr>';
echo '<tr>
        <td colspan="6" style="font-size:12px; text-align:center;">Date Created: '.$today.'</td>
      </tr>';
echo '<tr><td colspan="6">&nbsp;</td></tr>';

// Table Header
echo '<tr>
        <th style="background-color:#800000; color:#fff; font-weight:bold; text-align:center;">Enrollment ID</th>
        <th style="background-color:#800000; color:#fff; font-weight:bold; text-align:        <th style="background-color:#800000; color:#fff; font-weight:bold; text-align:center;">Enrollment ID</th>
;">Student ID</th>
        <th style="background-color:#800000; color:#fff; font-weight:bold; text-align:        <th style="background-color:#800000; color:#fff; font-weight:bold; text-align:center;">Enrollment ID</th>
;">Section ID</th>
        <th style="background-color:#800000; color:#fff; font-weight:bold; text-align:        <th style="background-color:#800000; color:#fff; font-weight:bold; text-align:center;">Enrollment ID</th>
;">Date Enrolled</th>
        <th style="background-color:#800000; color:#fff; font-weight:bold; text-align:        <th style="background-color:#800000; color:#fff; font-weight:bold; text-align:center;">Enrollment ID</th>
;">Status</th>
        <th style="background-color:#800000; color:#fff; font-weight:bold; text-align:        <th style="background-color:#800000; color:#fff; font-weight:bold; text-align:center;">Enrollment ID</th>
;">Letter Grade</th>
      </tr>';

// Fetch Data
$result = $conn->query("SELECT * FROM tbl_enrollment WHERE is_deleted = 0 ORDER BY enrollment_id DESC");
$i = 0;
while ($row = $result->fetch_assoc()) {
    $bg = $i % 2 === 0 ? '#ffffff' : '#f9f9f9';
    echo '<tr style="background-color: '.$bg.'; text-align:center;">
            <td>'.$row['enrollment_id'].'</td>
            <td>'.$row['student_id'].'</td>
            <td>'.$row['section_id'].'</td>
            <td>'.$row['date_enrolled'].'</td>
            <td>'.$row['status'].'</td>
            <td>'.$row['letter_grade'].'</td>
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

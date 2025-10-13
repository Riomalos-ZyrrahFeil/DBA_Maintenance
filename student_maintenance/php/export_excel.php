<?php
include '../../db.php';
header("Content-Type: application/vnd.ms-excel");
header("Content-Disposition: attachment; filename=students.xls");

$today = date("F d, Y");

// Start table
echo '<table border="1" style="width:100%; border-collapse: collapse; font-family: Poppins, sans-serif;">';

// University header
echo '<tr>
        <td colspan="8" style="font-size:16px; font-weight:bold; text-align:center; background-color:#800000; color:#fff;">
          Polytechnic University of the Philippines - Taguig Campus
        </td>
      </tr>';
echo '<tr>
        <td colspan="8" style="font-size:12px; text-align:center;">
          Date Created: '.$today.'
        </td>
      </tr>';
echo '<tr><td colspan="8">&nbsp;</td></tr>';

// Table header
echo '<tr>
        <th style="background-color:#800000; color:#fff; font-weight:bold; text-align:center;">ID</th>
        <th style="background-color:#800000; color:#fff; font-weight:bold; text-align:center;">Student No</th>
        <th style="background-color:#800000; color:#fff; font-weight:bold; text-align:center;">Full Name</th>
        <th style="background-color:#800000; color:#fff; font-weight:bold; text-align:center;">Email</th>
        <th style="background-color:#800000; color:#fff; font-weight:bold; text-align:center;">Gender</th>
        <th style="background-color:#800000; color:#fff; font-weight:bold; text-align:center;">Birthdate</th>
        <th style="background-color:#800000; color:#fff; font-weight:bold; text-align:center;">Year Level</th>
        <th style="background-color:#800000; color:#fff; font-weight:bold; text-align:center;">Program</th>
      </tr>';

// Fetch student data (exclude deleted)
$query = "
  SELECT s.*, p.program_name 
  FROM tbl_student s 
  LEFT JOIN tbl_program p ON s.program_id = p.program_id 
  WHERE s.is_deleted = 0 
  ORDER BY s.student_id ASC
";
$result = $conn->query($query);

$i = 0;
while ($row = $result->fetch_assoc()) {
    $bg = $i % 2 === 0 ? '#ffffff' : '#f9f9f9';
    echo '<tr style="background-color:'.$bg.';">
            <td>'.$row['student_id'].'</td>
            <td>'.$row['student_no'].'</td>
            <td>'.$row['student_name'].'</td>
            <td>'.$row['email'].'</td>
            <td>'.$row['gender'].'</td>
            <td>'.$row['birthdate'].'</td>
            <td>'.$row['year_level'].'</td>
            <td>'.$row['program_name'].'</td>
          </tr>';
    $i++;
}

// Footer with printed date and simple page info
echo '<tr><td colspan="8">&nbsp;</td></tr>';
echo '<tr>
        <td colspan="8" style="font-size:10px; text-align:right;">
          Printed on: '.$today.' | Page 1 of 1
        </td>
      </tr>';

echo '</table>';

$conn->close();
?>

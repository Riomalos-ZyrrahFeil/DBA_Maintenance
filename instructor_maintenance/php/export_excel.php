<?php
include '../../db.php';

header("Content-Type: application/vnd.ms-excel");
header("Content-Disposition: attachment; filename=instructors.xls");

$today = date("F d, Y");

// Start table
echo '<table border="1" style="width:100%; border-collapse: collapse; font-family: Poppins, sans-serif;">';

// University header
echo '<tr>
        <td colspan="4" style="font-size:16px; font-weight:bold; text-align:center; background-color:#800000; color:#fff;">
            Polytechnic University of the Philippines - Taguig Campus
        </td>
      </tr>';
echo '<tr>
        <td colspan="4" style="font-size:12px; text-align:center;">Date Created: '.$today.'</td>
      </tr>';
echo '<tr><td colspan="4">&nbsp;</td></tr>';

// Table header
echo '<tr>
        <th style="background-color:#800000; color:#fff; font-weight:bold; text-align:center;">ID</th>
        <th style="background-color:#800000; color:#fff; font-weight:bold; text-align:center;">Full Name</th>
        <th style="background-color:#800000; color:#fff; font-weight:bold; text-align:center;">Email</th>
        <th style="background-color:#800000; color:#fff; font-weight:bold; text-align:center;">Department</th>
      </tr>';

// Fetch data (only not deleted)
$result = $conn->query("
    SELECT i.instructor_id, CONCAT(i.first_name,' ',i.last_name) AS full_name, i.email, d.dept_name
    FROM tbl_instructor i
    LEFT JOIN tbl_department d ON i.dept_id = d.dept_id
    WHERE i.is_deleted=0
    ORDER BY i.instructor_id ASC
");

$i = 0;
while($row = $result->fetch_assoc()){
    // Alternate row colors
    $bg = $i % 2 === 0 ? '#ffffff' : '#f9f9f9';
    echo '<tr style="background-color: '.$bg.'; text-align:center;">
            <td>'.$row['instructor_id'].'</td>
            <td>'.$row['full_name'].'</td>
            <td>'.$row['email'].'</td>
            <td>'.$row['dept_name'].'</td>
          </tr>';
    $i++;
}

// Footer with printed date and page placeholder
echo '<tr><td colspan="4">&nbsp;</td></tr>';
echo '<tr>
        <td colspan="4" style="font-size:10px; text-align:right;">Printed on: '.$today.' | Page 1 of 1</td>
      </tr>';

echo '</table>';
$conn->close();
?>

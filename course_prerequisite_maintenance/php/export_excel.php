<?php
include '../../db.php';
header("Content-Type: application/vnd.ms-excel");
header("Content-Disposition: attachment; filename=course_prerequisites.xls");

$today = date("F d, Y");

// Start table
echo '<table border="1" style="width:100%; border-collapse: collapse; font-family: Poppins, sans-serif;">';

// University header
echo '<tr>
        <td colspan="5" style="font-size:16px; font-weight:bold; text-align:center; background-color:#800000; color:#fff;">
            Polytechnic University of the Philippines - Taguig Campus
        </td>
      </tr>';
echo '<tr>
        <td colspan="5" style="font-size:14px; font-weight:bold; text-align:center;">
            Course Prerequisite List
        </td>
      </tr>';
echo '<tr>
        <td colspan="5" style="font-size:12px; text-align:center;">
            Date Created: '.$today.'
        </td>
      </tr>';
echo '<tr><td colspan="5">&nbsp;</td></tr>';

// Table header
echo '<tr>
        <th style="background-color:#800000; color:#fff; font-weight:bold; text-align:center;">Prereq ID</th>
        <th style="background-color:#800000; color:#fff; font-weight:bold; text-align:center;">Course Code</th>
        <th style="background-color:#800000; color:#fff; font-weight:bold; text-align:center;">Course Title</th>
        <th style="background-color:#800000; color:#fff; font-weight:bold; text-align:center;">Prerequisite Code</th>
        <th style="background-color:#800000; color:#fff; font-weight:bold; text-align:center;">Prerequisite Name</th>
      </tr>';

// Fetch prerequisite data (only those not deleted)
$query = "
    SELECT 
        cp.prerequisite_id,
        c1.course_code AS course_code,
        c1.title AS course_title,
        c2.course_code AS prerequisite_code,
        c2.title AS prerequisite_title
    FROM tbl_course_prerequisite cp
    INNER JOIN tbl_course c1 ON cp.course_id = c1.course_id
    INNER JOIN tbl_course c2 ON cp.prereq_course_id = c2.course_id
    WHERE c1.is_deleted = 0 
      AND c2.is_deleted = 0 
      AND cp.is_deleted = 0
    ORDER BY c1.course_code ASC, c2.course_code ASC
";

$result = $conn->query($query);
$i = 0;

while ($row = $result->fetch_assoc()) {
    $bg = $i % 2 === 0 ? '#ffffff' : '#f9f9f9';
    echo '<tr style="background-color: '.$bg.'; text-align:left;">
            <td style="text-align:center;">'.$row['prerequisite_id'].'</td>
            <td style="text-align:center;">'.$row['course_code'].'</td>
            <td>'.$row['course_title'].'</td>
            <td style="text-align:center;">'.$row['prerequisite_code'].'</td>
            <td>'.$row['prerequisite_title'].'</td>
          </tr>';
    $i++;
}

// Footer
echo '<tr><td colspan="5">&nbsp;</td></tr>';
echo '<tr>
        <td colspan="5" style="font-size:10px; text-align:right;">
            Printed on: '.$today.' | Page 1 of 1
        </td>
      </tr>';

echo '</table>';

$conn->close();
?>
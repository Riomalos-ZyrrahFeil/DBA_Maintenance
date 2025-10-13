<?php
include '../../db.php';
header("Content-Type: application/vnd.ms-excel");
header("Content-Disposition: attachment; filename=terms.xls");

$today = date("F d, Y H:i");

// Start table
echo '<table border="1" style="width:100%; border-collapse: collapse; font-family: Poppins, sans-serif;">';

// University header
echo '<tr>
        <td colspan="4" style="font-size:16px; font-weight:bold; text-align:center; background-color:#800000; color:#fff;">Polytechnic University of the Philippines - Taguig Campus</td>
      </tr>';
echo '<tr>
        <td colspan="4" style="font-size:12px; text-align:center;">Date Created: '.$today.'</td>
      </tr>';
echo '<tr><td colspan="4">&nbsp;</td></tr>';

// Table header
echo '<tr>
        <th style="background-color:#800000; color:#fff; font-weight:bold; text-align:center;">Term ID</th>
        <th style="background-color:#800000; color:#fff; font-weight:bold; text-align:center;">Term Code</th>
        <th style="background-color:#800000; color:#fff; font-weight:bold; text-align:center;">Start Date</th>
        <th style="background-color:#800000; color:#fff; font-weight:bold; text-align:center;">End Date</th>
      </tr>';

// Fetch data
$result = $conn->query("SELECT * FROM tbl_term ORDER BY term_id ASC");
$i = 0;
while($row = $result->fetch_assoc()){
    $bg = $i % 2 === 0 ? '#ffffff' : '#f9f9f9';
    echo '<tr style="background-color: '.$bg.'; text-align:center">
            <td>'.$row['term_id'].'</td>
            <td>'.$row['term_code'].'</td>
            <td>'.$row['start_date'].'</td>
            <td>'.$row['end_date'].'</td>
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

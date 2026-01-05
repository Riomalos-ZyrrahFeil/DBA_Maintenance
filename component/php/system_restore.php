<?php
include '../../db.php';

if(isset($_FILES['backup_file'])) {
  $sql = file_get_contents($_FILES['backup_file']['tmp_name']);
  if($conn->multi_query($sql)) {
    echo json_encode(["status" => "success", "message" => "System restored successfully"]);
  }
}
?>
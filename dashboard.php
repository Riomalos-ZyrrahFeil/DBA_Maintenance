<?php
session_start();
include './db.php';

if (!isset($_SESSION['user_id'])) {
  header("Location: index.php");
  exit();
}

$user_role = $_SESSION['role'] ?? 'student';
$ref_id = $_SESSION['ref_id'] ?? 0;

if ($user_role === 'student') {
  $stmt = $conn->prepare("SELECT COUNT(*) FROM tbl_enrollment WHERE student_id = ? AND is_deleted = 0");
  $stmt->bind_param("i", $ref_id);
  $stmt->execute();
  $my_enrollments = $stmt->get_result()->fetch_row()[0];

  $stmt = $conn->prepare("SELECT student_name FROM tbl_student WHERE student_id = ?");
  $stmt->bind_param("i", $ref_id);
  $stmt->execute();
  $student_name = $stmt->get_result()->fetch_assoc()['student_name'] ?? 'Student';
} else {
  $total_students = $conn->query("SELECT COUNT(*) FROM tbl_student WHERE is_deleted = 0")->fetch_row()[0];
  $total_enrollments = $conn->query("SELECT COUNT(*) FROM tbl_enrollment WHERE is_deleted = 0")->fetch_row()[0];
  $total_sections = $conn->query("SELECT COUNT(*) FROM tbl_section WHERE is_deleted = 0")->fetch_row()[0];
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Dashboard - PUP Maintenance</title>
  <link rel="stylesheet" href="dashboard.css"> 
</head>
<body>
  <div class="dash-main-wrapper">
    <?php include('component/sidebar.php'); ?>

    <main class="main-content">
      <header style="margin-bottom: 2.5rem;">
          <h1>Welcome, <?php echo ($user_role === 'student') ? $student_name : 'System Administrator'; ?></h1>
          <p>Logged in as: <span style="color: var(--primary-maroon); font-weight: 600;"><?php echo ucwords(str_replace('_', ' ', $user_role)); ?></span></p>
      </header>
      
      <div class="stat-grid">
          <?php if ($user_role === 'student'): ?>
              <div class="stat-card">
                  <h3>My Enrolled Subjects</h3>
                  <p class="number"><?php echo $my_enrollments; ?></p>
              </div>
              <div class="stat-card">
                  <h3>Current Status</h3>
                  <p class="number" style="font-size: 1.8rem;">Regular</p>
              </div>
          <?php else: ?>
              <div class="stat-card">
                  <h3>Total Students</h3>
                  <p class="number"><?php echo number_format($total_students); ?></p>
              </div>
              <div class="stat-card">
                  <h3>Active Enrollments</h3>
                  <p class="number"><?php echo number_format($total_enrollments); ?></p>
              </div>
              <div class="stat-card">
                  <h3>Current Sections</h3>
                  <p class="number"><?php echo number_format($total_sections); ?></p>
              </div>
          <?php endif; ?>
      </div>

      <?php if ($user_role === 'super_admin'): ?>
      <div class="admin-utilities card">
          <h2>System Maintenance Tools</h2>
          <div class="util-buttons">
              <button onclick="triggerBackup()" class="primary-btn">
                  <i class="fas fa-database"></i> Generate System Backup
              </button>
              <button onclick="document.getElementById('restoreFile').click()" class="secondary-btn">
                  <i class="fas fa-upload"></i> Restore from File
              </button>
              <input type="file" id="restoreFile" style="display:none" onchange="handleRestore(this)">
          </div>
      </div>
      <?php endif; ?>
  </main>
  </div>

  <script>
    function triggerBackup() {
      if(confirm("Identify system state and download backup (.sql)?")) {
        window.location.href = '/dashboard/MaintenanceModule/php/system_backup.php';
      }
    }

    async function handleRestore(input) {
      if (!input.files.length) return;
      const formData = new FormData();
      formData.append('backup_file', input.files[0]);

      if(confirm("WARNING: Restore is for new installations. Current data will be OVERWRITTEN. Proceed?")) {
        const resp = await fetch('/dashboard/MaintenanceModule/php/system_restore.php', {
          method: 'POST',
          body: formData
        });
        const result = await resp.json();
        alert(result.message);
        if(result.status === 'success') location.reload();
      }
    }
  </script>
</body>
</html>
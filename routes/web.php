<?php

use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\Admin\SystemOversightController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\OtpController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Staff1\InventoryController;
use App\Http\Controllers\Staff1\ResourceDispatchController;
use App\Http\Controllers\Staff1\PersonnelTrainingController;
use App\Http\Controllers\Staff1\MonitoringAlertController;
use App\Http\Controllers\Staff1\StockStatusController;
use App\Http\Controllers\Staff1\InventoryReportController;
use App\Http\Controllers\Staff1\BarangayIssuanceController;
use App\Http\Controllers\Staff1\ConsumptionReportController;
use App\Http\Controllers\Staff1\PostEventReportController as Staff1PostEventReportController;
use App\Http\Controllers\Staff2\IncidentController;
use App\Http\Controllers\Staff2\PostEventReportController;
use App\Http\Controllers\Staff2\ResponderController;
use App\Http\Controllers\Staff2\HazardMapController;
use App\Models\Incident;
use App\Models\Patient;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
})->name('welcome');

// Authentication routes
Route::get('/login', fn () => redirect()->route('welcome'))->name('login.get');
Route::post('/send-otp', [LoginController::class, 'sendOtp'])->name('send.otp');
Route::post('/login', [LoginController::class, 'login'])->name('login');
Route::post('/logout', [LoginController::class, 'logout'])->name('logout');
Route::get('/otp/verify', [OtpController::class, 'showVerifyForm'])->name('otp.verify');
Route::post('/otp/verify', [OtpController::class, 'verify'])->name('otp.verify.submit');
Route::post('/otp/resend', [OtpController::class, 'resend'])->name('otp.resend');

// Registration routes
Route::post('/register', [RegisterController::class, 'register'])->name('register');
Route::post('/register/verify', [RegisterController::class, 'verifyRegistration'])->name('register.verify');

Route::get('/admin/dashboard', fn () => Inertia::render('Admin/Dashboard'))->name('admin.dashboard')->middleware('auth', 'role:admin');
Route::get('/staff-1/dashboard', fn () => Inertia::render('Staff1/Dashboard'))->name('staff1.dashboard')->middleware('auth', 'role:staff1');
Route::get('/staff-2/dashboard', fn () => Inertia::render('Staff2/Dashboard'))->name('staff2.dashboard')->middleware('auth', 'role:staff2');

Route::redirect('/inventory/dashboard', '/staff-1/dashboard');

Route::prefix('admin')->middleware('auth', 'role:admin')->group(function () {
    Route::get('/reports', [ReportController::class, 'index'])->name('admin.reports');
    Route::get('/users', [UserManagementController::class, 'index'])->name('admin.users');
    Route::post('/users', [UserManagementController::class, 'store'])->name('admin.users.store');
    Route::patch('/users/{user}/role', [UserManagementController::class, 'updateRole'])->name('admin.users.role');
    Route::post('/users/{user}/approve', [UserManagementController::class, 'approveUser'])->name('admin.users.approve');
    Route::post('/users/{user}/reject', [UserManagementController::class, 'rejectUser'])->name('admin.users.reject');
    Route::delete('/users/{user}', [UserManagementController::class, 'destroy'])->name('admin.users.destroy');
    Route::get('/oversight', [SystemOversightController::class, 'index'])->name('admin.oversight');
});

// Staff 1 Routes
Route::prefix('staff-1')->middleware('auth', 'role:staff1')->group(function () {
    Route::get('/inventory', [InventoryController::class, 'index'])->name('staff1.inventory');
    Route::post('/inventory', [InventoryController::class, 'store'])->name('staff1.inventory.store');
    Route::patch('/inventory/{item}', [InventoryController::class, 'update'])->name('staff1.inventory.update');
    Route::delete('/inventory/{item}', [InventoryController::class, 'destroy'])->name('staff1.inventory.destroy');

    Route::get('/dispatches', [ResourceDispatchController::class, 'index'])->name('staff1.dispatches');
    Route::post('/dispatches', [ResourceDispatchController::class, 'store'])->name('staff1.dispatches.store');
    Route::patch('/dispatches/{dispatch}', [ResourceDispatchController::class, 'update'])->name('staff1.dispatches.update');

    Route::get('/dispatch-requests', fn () => Inertia::render('Staff1/DispatchRequests'))->name('staff1.dispatch-requests');

    Route::get('/personnel', [PersonnelTrainingController::class, 'index'])->name('staff1.personnel');
    Route::post('/personnel', [PersonnelTrainingController::class, 'store'])->name('staff1.personnel.store');
    Route::patch('/personnel/{personnel}', [PersonnelTrainingController::class, 'update'])->name('staff1.personnel.update');
    Route::delete('/personnel/{personnel}', [PersonnelTrainingController::class, 'destroy'])->name('staff1.personnel.destroy');

    Route::get('/monitoring', [MonitoringAlertController::class, 'index'])->name('staff1.monitoring');

    Route::get('/stock-status', [StockStatusController::class, 'index'])->name('staff1.stock-status');

    Route::get('/inventory-reports', [InventoryReportController::class, 'index'])->name('staff1.inventory-reports');

    Route::get('/barangay-issuance', [BarangayIssuanceController::class, 'index'])->name('staff1.barangay-issuance');
    Route::post('/barangay-issuance', [BarangayIssuanceController::class, 'store'])->name('staff1.barangay-issuance.store');

    Route::get('/consumption-reports', [ConsumptionReportController::class, 'index'])->name('staff1.consumption-reports');

    Route::get('/post-event', [Staff1PostEventReportController::class, 'index'])->name('staff1.post-event');
    Route::post('/post-event', [Staff1PostEventReportController::class, 'store'])->name('staff1.post-event.store');
});

// Staff 2 Routes
Route::prefix('staff-2')->middleware('auth', 'role:staff2')->group(function () {
    Route::get('/incidents', [IncidentController::class, 'index'])->name('staff2.incidents');
    Route::post('/incidents', [IncidentController::class, 'store'])->name('staff2.incidents.store');
    Route::patch('/incidents/{incident}', [IncidentController::class, 'update'])->name('staff2.incidents.update');
    Route::delete('/incidents/{incident}', [IncidentController::class, 'destroy'])->name('staff2.incidents.destroy');

    Route::get('/reports', [PostEventReportController::class, 'index'])->name('staff2.reports');
    Route::post('/reports', [PostEventReportController::class, 'store'])->name('staff2.reports.store');
    Route::patch('/reports/{report}', [PostEventReportController::class, 'update'])->name('staff2.reports.update');
    Route::delete('/reports/{report}', [PostEventReportController::class, 'destroy'])->name('staff2.reports.destroy');

    Route::get('/responders', [ResponderController::class, 'index'])->name('staff2.responders');
    Route::post('/responders', [ResponderController::class, 'store'])->name('staff2.responders.store');
    Route::patch('/responders/{patient}', [ResponderController::class, 'update'])->name('staff2.responders.update');
    Route::delete('/responders/{patient}', [ResponderController::class, 'destroy'])->name('staff2.responders.destroy');

    Route::get('/hazard-map', [HazardMapController::class, 'index'])->name('staff2.hazard-map');
    Route::post('/hazard-map', [HazardMapController::class, 'store'])->name('staff2.hazard-map.store');
    Route::post('/hazard-map/{hazardMapImage}', [HazardMapController::class, 'update'])->name('staff2.hazard-map.update');
    Route::post('/barangays', [HazardMapController::class, 'storeBarangay'])->name('staff2.barangays.store');
    Route::post('/barangays/{barangay}', [HazardMapController::class, 'updateBarangay'])->name('staff2.barangays.update');
    Route::delete('/hazard-map/{hazardMapImage}', [HazardMapController::class, 'destroy'])->name('staff2.hazard-map.destroy');

    Route::get('/acknowledge', fn () => Inertia::render('Staff2/AcknowledgeReports', [
        'incidents' => Incident::with('patients')->orderBy('reported_at', 'desc')->get(),
    ]))->name('staff2.acknowledge');

    Route::get('/response-status', fn () => Inertia::render('Staff2/ResponseStatus', [
        'incidents' => Incident::orderBy('reported_at', 'desc')->get(),
        'patients' => Patient::with('incident')->get(),
        'responders' => [],
    ]))->name('staff2.response-status');

    Route::get('/incident-map', fn () => Inertia::render('Staff2/IncidentMap', [
        'incidents' => Incident::whereNotNull('latitude')->whereNotNull('longitude')->orderBy('reported_at', 'desc')->get(),
    ]))->name('staff2.incident-map');
});

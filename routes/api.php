<?php

use App\Http\Controllers\Api\DispatchRequestController;
use App\Http\Controllers\Api\EquipmentReturnApiController;
use App\Http\Controllers\Api\InventoryApiController;
use App\Http\Controllers\Api\IncidentApiController;
use App\Http\Controllers\Api\NotificationController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| These routes are for the mobile application to access data via API.
|
*/

// Inventory API Routes
Route::get('/inventory', [InventoryApiController::class, 'index']);
Route::get('/inventory/{item}', [InventoryApiController::class, 'show']);
Route::post('/inventory', [InventoryApiController::class, 'store']);
Route::patch('/inventory/{item}', [InventoryApiController::class, 'update']);
Route::put('/inventory/{item}', [InventoryApiController::class, 'update']);
Route::delete('/inventory/{item}', [InventoryApiController::class, 'destroy']);

// Incidents API Routes
Route::get('/incidents', [IncidentApiController::class, 'index']);
Route::get('/incidents/{incident}', [IncidentApiController::class, 'show']);
Route::post('/incidents', [IncidentApiController::class, 'store']);
Route::patch('/incidents/{incident}', [IncidentApiController::class, 'update']);
Route::delete('/incidents/{incident}', [IncidentApiController::class, 'destroy']);
Route::post('/incidents/{incident}/verify', [IncidentApiController::class, 'verify']);

// Dispatch Request API Routes
Route::get('/dispatch-request', [DispatchRequestController::class, 'index'])->name('dispatch-request.index');
Route::post('/dispatch-request', [DispatchRequestController::class, 'store'])->name('dispatch-request.store');
Route::patch('/dispatch-request/{dispatchRequest}', [DispatchRequestController::class, 'update'])->name('dispatch-request.update');
Route::delete('/dispatch-request/{dispatchRequest}', [DispatchRequestController::class, 'destroy'])->name('dispatch-request.destroy');

// Notifications API Routes
Route::get('/notifications', [NotificationController::class, 'index']);
Route::post('/notifications', [NotificationController::class, 'store']);
Route::patch('/notifications/{notification}/mark-as-read', [NotificationController::class, 'markAsRead']);
Route::delete('/notifications/{notification}', [NotificationController::class, 'destroy']);

// Equipment Returns API Routes
Route::get('/equipment-returns', [EquipmentReturnApiController::class, 'index']);
Route::post('/equipment-returns', [EquipmentReturnApiController::class, 'store']);
Route::patch('/equipment-returns/{return}', [EquipmentReturnApiController::class, 'update']);
Route::delete('/equipment-returns/{return}', [EquipmentReturnApiController::class, 'destroy']);

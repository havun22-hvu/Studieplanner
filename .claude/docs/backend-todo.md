# Backend TODO

> Aanpassingen nodig in Studieplanner-api (Laravel)

## Database Migratie

### Users tabel uitbreiden

```php
// database/migrations/xxxx_add_premium_to_users.php
Schema::table('users', function (Blueprint $table) {
    $table->boolean('is_premium')->default(false);
    $table->datetime('premium_until')->nullable();
});
```

## Nieuwe Endpoints

### 1. GET /api/premium/status

Premium status van ingelogde user.

**Controller:** `PremiumController@status`

```php
public function status(Request $request)
{
    $user = $request->user();

    return response()->json([
        'is_premium' => $user->is_premium && $user->premium_until > now(),
        'expires_at' => $user->premium_until,
    ]);
}
```

### 2. GET /api/premium/stats

Statistieken voor premium users.

**Controller:** `PremiumController@stats`

**Response:**
```json
{
  "total_hours": {
    "week": 5.5,
    "month": 22.3
  },
  "by_subject": [
    { "name": "Nederlands", "hours": 2.5, "color": "#4f46e5" }
  ],
  "completion_rate": 0.85,
  "trend": [
    { "date": "2024-03-04", "hours": 1.2 }
  ]
}
```

**Query logica:**
- `total_hours.week`: SUM(minutes_actual) / 60 WHERE date >= now()->subWeek()
- `total_hours.month`: SUM(minutes_actual) / 60 WHERE date >= now()->subMonth()
- `by_subject`: GROUP BY subject_id
- `completion_rate`: COUNT(completed=true) / COUNT(*)
- `trend`: GROUP BY date, laatste 14 dagen

### 3. GET /api/premium/learning-speed

Leersnelheid per vak.

**Controller:** `PremiumController@learningSpeed`

**Response:**
```json
{
  "speeds": [
    {
      "subject_id": 1,
      "subject_name": "Nederlands",
      "pages_per_hour": 12.5,
      "exercises_per_hour": 8.2
    }
  ]
}
```

**Berekening:**
```php
// Per vak, per unit type
$pagesPerHour = $sessions
    ->where('unit', 'blz')
    ->avg(fn($s) => ($s->amount_actual / $s->minutes_actual) * 60);
```

## Routes

```php
// routes/api.php
Route::middleware('auth:sanctum')->group(function () {
    // Bestaande routes...

    Route::prefix('premium')->group(function () {
        Route::get('status', [PremiumController::class, 'status']);
        Route::get('stats', [PremiumController::class, 'stats'])
            ->middleware('premium');
        Route::get('learning-speed', [PremiumController::class, 'learningSpeed'])
            ->middleware('premium');
    });
});
```

## Middleware

### PremiumMiddleware

```php
// app/Http/Middleware/PremiumMiddleware.php
public function handle($request, Closure $next)
{
    $user = $request->user();

    if (!$user->is_premium || $user->premium_until < now()) {
        return response()->json([
            'message' => 'Premium subscription required'
        ], 403);
    }

    return $next($request);
}
```

Register in `bootstrap/app.php` of `Kernel.php`:
```php
'premium' => \App\Http\Middleware\PremiumMiddleware::class,
```

## User Model

```php
// app/Models/User.php
protected $casts = [
    // bestaande casts...
    'is_premium' => 'boolean',
    'premium_until' => 'datetime',
];

public function isPremiumActive(): bool
{
    return $this->is_premium && $this->premium_until > now();
}
```

## Checklist

- [ ] Migratie: premium velden aan users
- [ ] PremiumController aanmaken
- [ ] PremiumMiddleware aanmaken
- [ ] Routes toevoegen
- [ ] User model updaten
- [ ] Testen: status endpoint
- [ ] Testen: stats endpoint
- [ ] Testen: learning-speed endpoint

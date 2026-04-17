<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;

class TaskController extends Controller
{
    public function summary(Request $request)
    {
        $user = $request->user();
        $base = Task::query()->where('user_id', $user->id);

        $today = Carbon::today();

        $todayCount = (clone $base)
            ->whereDate('due_at', $today)
            ->count();

        $completedCount = (clone $base)
            ->where('status', 'completed')
            ->count();

        $now = Carbon::now();

        $pendingCount = (clone $base)
            ->where('status', 'pending')
            ->where(function ($q) use ($now) {
                $q->whereNull('due_at')
                    ->orWhere('due_at', '>=', $now);
            })
            ->count();

        $overdueCount = (clone $base)
            ->where('status', 'pending')
            ->whereNotNull('due_at')
            ->where('due_at', '<', $now)
            ->count();

        $dueSoon = (clone $base)
            ->where('status', 'pending')
            ->whereNotNull('due_at')
            ->where('due_at', '>', $now)
            ->where('due_at', '<=', $now->copy()->addHour())
            ->with('category:id,name')
            ->orderBy('due_at')
            ->limit(25)
            ->get()
            ->map(fn (Task $t) => [
                'id' => $t->id,
                'title' => $t->title,
                'due_at' => $t->due_at->toIso8601String(),
                'category' => $t->category
                    ? ['id' => $t->category->id, 'name' => $t->category->name]
                    : null,
            ])
            ->values()
            ->all();

        return response()->json([
            'today' => $todayCount,
            'completed' => $completedCount,
            'pending' => $pendingCount,
            'overdue' => $overdueCount,
            'due_soon' => $dueSoon,
        ]);
    }

    public function index(Request $request)
    {
        $tasks = Task::query()
            ->where('user_id', $request->user()->id)
            ->with('category:id,name')
            ->orderByRaw("CASE WHEN status = 'pending' THEN 0 ELSE 1 END")
            ->orderByRaw('due_at IS NULL')
            ->orderBy('due_at')
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['data' => $tasks]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'due_date' => ['nullable', 'date'],
            'due_time' => ['nullable', 'string', 'regex:/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
        ]);

        $this->assertTimeRequiresDateForStore($request);

        if (! empty($validated['category_id'])) {
            $ownsCategory = $request->user()
                ->categories()
                ->where('id', $validated['category_id'])
                ->exists();

            if (! $ownsCategory) {
                return response()->json([
                    'message' => 'Invalid category.',
                ], 422);
            }
        }

        $dueAt = $this->resolveDueAt(
            $validated['due_date'] ?? null,
            $validated['due_time'] ?? null
        );

        $task = Task::create([
            'user_id' => $request->user()->id,
            'category_id' => $validated['category_id'] ?? null,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'status' => 'pending',
            'due_at' => $dueAt,
        ]);

        $task->load('category:id,name');

        return response()->json(['data' => $task], 201);
    }

    public function update(Request $request, Task $task)
    {
        $this->ensureOwned($request, $task);

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'due_date' => ['sometimes', 'nullable', 'date'],
            'due_time' => ['nullable', 'string', 'regex:/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'status' => ['sometimes', 'string', 'in:pending,completed'],
        ]);

        $this->assertTimeRequiresDateForUpdate($request, $task);

        if (array_key_exists('category_id', $validated) && $validated['category_id'] !== null) {
            $ownsCategory = $request->user()
                ->categories()
                ->where('id', $validated['category_id'])
                ->exists();

            if (! $ownsCategory) {
                return response()->json([
                    'message' => 'Invalid category.',
                ], 422);
            }
        }

        if ($request->exists('due_date')) {
            $date = $request->input('due_date');
            $task->due_at = ($date === null || $date === '')
                ? null
                : $this->resolveDueAt($date, $request->input('due_time'));
        } elseif ($request->has('due_time') && $task->due_at) {
            $task->due_at = $this->resolveDueAt(
                $task->due_at->toDateString(),
                $request->input('due_time')
            );
        }

        $task->fill(collect($validated)->except(['due_date', 'due_time'])->all());
        $task->save();
        $task->load('category:id,name');

        return response()->json(['data' => $task]);
    }

    public function destroy(Request $request, Task $task)
    {
        $this->ensureOwned($request, $task);
        $task->delete();

        return response()->json(null, 204);
    }

    private function ensureOwned(Request $request, Task $task): void
    {
        abort_unless($task->user_id === $request->user()->id, 404);
    }

    private function assertTimeRequiresDateForStore(Request $request): void
    {
        if ($request->filled('due_time') && ! $request->filled('due_date')) {
            throw ValidationException::withMessages([
                'due_time' => ['Add a due date when setting a time.'],
            ]);
        }
    }

    private function assertTimeRequiresDateForUpdate(Request $request, Task $task): void
    {
        if (
            $request->filled('due_time')
            && ! $request->filled('due_date')
            && ! $task->due_at
        ) {
            throw ValidationException::withMessages([
                'due_time' => ['Add a due date when setting a time.'],
            ]);
        }
    }

    private function resolveDueAt(?string $date, ?string $time): ?Carbon
    {
        if ($date === null || $date === '') {
            return null;
        }

        $tz = config('app.timezone');
        $base = Carbon::parse($date, $tz)->startOfDay();

        if ($time !== null && $time !== '') {
            $parts = explode(':', $time);
            $h = (int) ($parts[0] ?? 0);
            $m = (int) ($parts[1] ?? 0);
            $s = (int) ($parts[2] ?? 0);

            return $base->copy()->setTime($h, $m, $s);
        }

        return $base->copy()->endOfDay();
    }
}

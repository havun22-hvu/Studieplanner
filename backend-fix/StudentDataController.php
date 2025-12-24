<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PlannedSession;
use App\Models\Subject;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class StudentDataController extends Controller
{
    public function subjects(Request $request)
    {
        $user = $request->user();

        $subjects = $user->subjects()->with('tasks')->get()->map(function ($subject) {
            return [
                'id' => (string) $subject->id,
                'name' => $subject->name,
                'color' => $subject->color,
                'examDate' => $subject->exam_date->format('Y-m-d'),
                'tasks' => $subject->tasks->map(function ($task) {
                    return [
                        'id' => (string) $task->id,
                        'description' => $task->description,
                        'estimatedMinutes' => $task->estimated_minutes,
                        'plannedAmount' => $task->planned_amount,
                        'unit' => $task->unit,
                        'completed' => $task->completed,
                    ];
                }),
            ];
        });

        return response()->json($subjects);
    }

    public function syncSubjects(Request $request)
    {
        $user = $request->user();
        $subjects = $request->input('subjects', []);

        Log::info('Syncing subjects for user ' . $user->id . ', count: ' . count($subjects));

        // Build mapping of frontend ID to backend ID
        $subjectMapping = [];
        $taskMapping = [];

        // Delete all existing subjects for this user and recreate
        $user->subjects()->delete();

        foreach ($subjects as $subjectData) {
            $frontendSubjectId = $subjectData['id'];

            $subject = Subject::create([
                'user_id' => $user->id,
                'name' => $subjectData['name'],
                'color' => $subjectData['color'],
                'exam_date' => $subjectData['examDate'],
            ]);

            $subjectMapping[$frontendSubjectId] = $subject->id;

            foreach ($subjectData['tasks'] ?? [] as $taskData) {
                $frontendTaskId = $taskData['id'];

                $task = Task::create([
                    'subject_id' => $subject->id,
                    'description' => $taskData['description'],
                    'estimated_minutes' => $taskData['estimatedMinutes'],
                    'planned_amount' => $taskData['plannedAmount'] ?? 0,
                    'unit' => $taskData['unit'] ?? 'blz',
                    'completed' => $taskData['completed'] ?? false,
                ]);

                $taskMapping[$frontendTaskId] = $task->id;
            }
        }

        // Store mappings in cache for the sessions sync
        cache()->put('subject_mapping_' . $user->id, $subjectMapping, 300);
        cache()->put('task_mapping_' . $user->id, $taskMapping, 300);

        return response()->json([
            'message' => 'Subjects synced successfully',
            'count' => count($subjects),
            'subjectMapping' => $subjectMapping,
            'taskMapping' => $taskMapping,
        ]);
    }

    public function sessions(Request $request)
    {
        $user = $request->user();

        $sessions = $user->plannedSessions()->get()->map(function ($session) {
            return [
                'id' => (string) $session->id,
                'date' => $session->date->format('Y-m-d'),
                'taskId' => (string) $session->task_id,
                'subjectId' => (string) $session->subject_id,
                'hour' => $session->hour,
                'minutesPlanned' => $session->minutes_planned,
                'minutesActual' => $session->minutes_actual,
                'amountPlanned' => $session->amount_planned,
                'amountActual' => $session->amount_actual,
                'unit' => $session->unit,
                'completed' => $session->completed,
                'knowledgeRating' => $session->knowledge_rating,
            ];
        });

        return response()->json($sessions);
    }

    public function syncSessions(Request $request)
    {
        $user = $request->user();
        $sessions = $request->input('sessions', []);

        Log::info('Syncing sessions for user ' . $user->id . ', count: ' . count($sessions));

        // Get mappings from cache
        $subjectMapping = cache()->get('subject_mapping_' . $user->id, []);
        $taskMapping = cache()->get('task_mapping_' . $user->id, []);

        Log::info('Subject mapping: ' . json_encode($subjectMapping));
        Log::info('Task mapping: ' . json_encode($taskMapping));

        // Delete existing sessions
        $user->plannedSessions()->delete();

        $created = 0;
        foreach ($sessions as $sessionData) {
            $frontendSubjectId = $sessionData['subjectId'];
            $frontendTaskId = $sessionData['taskId'];

            // Map frontend IDs to backend IDs
            $backendSubjectId = $subjectMapping[$frontendSubjectId] ?? null;
            $backendTaskId = $taskMapping[$frontendTaskId] ?? null;

            if (!$backendSubjectId || !$backendTaskId) {
                Log::warning('Could not map session: subjectId=' . $frontendSubjectId . ', taskId=' . $frontendTaskId);
                continue;
            }

            PlannedSession::create([
                'user_id' => $user->id,
                'subject_id' => $backendSubjectId,
                'task_id' => $backendTaskId,
                'date' => $sessionData['date'],
                'hour' => $sessionData['hour'] ?? null,
                'minutes_planned' => $sessionData['minutesPlanned'],
                'minutes_actual' => $sessionData['minutesActual'] ?? null,
                'amount_planned' => $sessionData['amountPlanned'] ?? 0,
                'amount_actual' => $sessionData['amountActual'] ?? null,
                'unit' => $sessionData['unit'] ?? 'blz',
                'completed' => $sessionData['completed'] ?? false,
                'knowledge_rating' => $sessionData['knowledgeRating'] ?? null,
            ]);
            $created++;
        }

        return response()->json(['message' => 'Sessions synced', 'created' => $created]);
    }

    public function generateInvite(Request $request)
    {
        $user = $request->user();

        \App\Models\StudentInvite::where('student_id', $user->id)->delete();

        $code = strtoupper(Str::random(8));
        $invite = \App\Models\StudentInvite::create([
            'student_id' => $user->id,
            'code' => $code,
            'expires_at' => now()->addHours(24),
        ]);

        return response()->json([
            'invite_code' => $invite->code,
            'message' => 'Invite code generated (valid for 24 hours)',
        ]);
    }

    public function mentors(Request $request)
    {
        $user = $request->user();

        $mentors = $user->mentors()->get()->map(function ($mentor) {
            return [
                'id' => $mentor->id,
                'name' => $mentor->name,
            ];
        });

        return response()->json($mentors);
    }
}

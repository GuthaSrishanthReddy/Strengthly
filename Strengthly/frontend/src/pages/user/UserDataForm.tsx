import { useEffect, useState } from "react";
import { api } from "../../services/api";

type FitnessGoal =
    | "FAT_LOSS"
    | "WEIGHT_GAIN"
    | "MUSCLE_GAIN"
    | "MAINTENANCE"
    | "STRENGTH_INCREASE"
    | "ENDURANCE_INCREASE"
    | "FLEXIBILITY"
    | "MOBILITY"
    | "BALANCE"
    | "ATHLETIC_PERFORMANCE"
    | "PHYSICAL_REHABILITATION";

type FitnessLevel =
    | "BEGINNER"
    | "INTERMEDIATE"
    | "ADVANCED"
    | "ATHLETE";

type ActivityType =
    | "WEIGHT_TRAINING"
    | "BODYWEIGHT"
    | "YOGA"
    | "PILATES"
    | "RUNNING"
    | "WALKING"
    | "HIKING"
    | "CYCLING"
    | "SWIMMING"
    | "CROSSFIT"
    | "HIIT"
    | "DANCE"
    | "MARTIAL_ARTS"
    | "SPORTS"
    | "HOME_WORKOUTS"
    | "OUTDOOR_TRAINING"
    | "MIXED_TRAINING";

interface RuleResponse {
    activity: ActivityType;
}

export default function UserDataForm() {
    const [goal, setGoal] = useState<FitnessGoal | "">("");
    const [level, setLevel] = useState<FitnessLevel | "">("");
    const [activity, setActivity] = useState<ActivityType | "">("");

    const [allowedActivities, setAllowedActivities] = useState<ActivityType[]>([]);
    const [loadingActivities, setLoadingActivities] = useState(false);

    // 🔐 Fetch allowed activities whenever goal or level changes
    useEffect(() => {
        if (!goal || !level) {
            setAllowedActivities([]);
            setActivity("");
            return;
        }

        const fetchAllowedActivities = async () => {
            try {
                setLoadingActivities(true);
                setActivity("");

                const params = new URLSearchParams({ goal, level });
                const data = await api<RuleResponse[]>(`/rules/activities?${params.toString()}`);
                setAllowedActivities(data.map((r) => r.activity));
            } catch (error) {
                console.error("Failed to fetch activities", error);
                setAllowedActivities([]);
            } finally {
                setLoadingActivities(false);
            }
        };

        fetchAllowedActivities();
    }, [goal, level]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!goal || !level || !activity) {
            alert("Please complete all fields");
            return;
        }

        const payload = {
            fitnessGoal: goal,
            fitnessLevel: level,
            activityType: activity
        };

        console.log("Submitting user data:", payload);
        // POST to backend here
    };

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: 420 }}>
            <h2>User Fitness Details</h2>

            {/* 🎯 GOAL */}
            <label>
                Fitness Goal
                <select value={goal} onChange={e => setGoal(e.target.value as FitnessGoal)}>
                    <option value="">Select goal</option>
                    {[
                        "FAT_LOSS",
                        "WEIGHT_GAIN",
                        "MUSCLE_GAIN",
                        "MAINTENANCE",
                        "STRENGTH_INCREASE",
                        "ENDURANCE_INCREASE",
                        "FLEXIBILITY",
                        "MOBILITY",
                        "BALANCE",
                        "ATHLETIC_PERFORMANCE",
                        "PHYSICAL_REHABILITATION"
                    ].map(g => (
                        <option key={g} value={g}>{g}</option>
                    ))}
                </select>
            </label>

            {/* 📊 LEVEL */}
            <label>
                Fitness Level
                <select value={level} onChange={e => setLevel(e.target.value as FitnessLevel)}>
                    <option value="">Select level</option>
                    {["BEGINNER", "INTERMEDIATE", "ADVANCED", "ATHLETE"].map(l => (
                        <option key={l} value={l}>{l}</option>
                    ))}
                </select>
            </label>

            {/* 🏃 ACTIVITY (STRICTLY FILTERED) */}
            <label>
                Activity Type
                <select
                    value={activity}
                    onChange={e => setActivity(e.target.value as ActivityType)}
                    disabled={!goal || !level || loadingActivities}
                >
                    <option value="">
                        {loadingActivities ? "Loading activities..." : "Select activity"}
                    </option>
                    {allowedActivities.map(a => (
                        <option key={a} value={a}>{a}</option>
                    ))}
                </select>
            </label>

            <button type="submit" disabled={!activity}>
                Save Details
            </button>
        </form>
    );
}

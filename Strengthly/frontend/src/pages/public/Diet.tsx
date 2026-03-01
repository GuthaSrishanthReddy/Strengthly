import React from "react";
import "./Diet.css";

const Diet = () => {
    return (
        <div className="diet-page">
            <h1>Sample Diet Plan</h1>
            <p>This is a static diet plan to help you stay healthy.</p>
            <ul>
                <li>Breakfast: Oatmeal with fruits and nuts</li>
                <li>Snack: Greek yogurt</li>
                <li>Lunch: Grilled chicken salad with quinoa</li>
                <li>Snack: Apple slices with peanut butter</li>
                <li>Dinner: Baked salmon, steamed broccoli, and sweet potatoes</li>
            </ul>
        </div>
    );
};

export default Diet;

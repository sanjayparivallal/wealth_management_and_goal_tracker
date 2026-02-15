"""
Script to seed risk_questions table with initial data.
Run this once after creating the database tables.
"""

import sys
import os

# Add parent directory to path to import database
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import get_db_connection


def seed_risk_questions():
    """Insert risk assessment questions into the database."""
    
    questions = [
        {
            "id": 1,
            "question": "If your investment suddenly falls by 20%, what would you most likely do?",
            "option1": "Exit the investment to prevent further decline",
            "option2": "Remain invested and wait for improvement",
            "option3": "Increase investment to benefit from lower prices",
            "option1_score": 2,
            "option2_score": 4,
            "option3_score": 6
        },
        {
            "id": 2,
            "question": "For what duration are you planning to stay invested?",
            "option1": "Under 1 year",
            "option2": "Between 1 and 5 years",
            "option3": "More than 5 years",
            "option1_score": 2,
            "option2_score": 4,
            "option3_score": 6
        },
        {
            "id": 3,
            "question": "Which option best reflects your attitude toward investing?",
            "option1": "I focus on protecting my capital with minimal risk",
            "option2": "I accept some risk for moderate returns",
            "option3": "I am willing to take high risk for higher returns",
            "option1_score": 2,
            "option2_score": 4,
            "option3_score": 6
        },
        {
            "id": 4,
            "question": "How would you rate your understanding of financial markets?",
            "option1": "No prior experience",
            "option2": "Some basic knowledge",
            "option3": "Advanced understanding",
            "option1_score": 2,
            "option2_score": 4,
            "option3_score": 6
        },
        {
            "id": 5,
            "question": "What amount of annual loss are you comfortable handling?",
            "option1": "Maximum 5%",
            "option2": "Between 5% and 15%",
            "option3": "Above 15%",
            "option1_score": 2,
            "option2_score": 4,
            "option3_score": 6
        }
    ]

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        for q in questions:
            cur.execute("""
                INSERT INTO risk_questions 
                    (id, question, option1, option2, option3, option1_score, option2_score, option3_score)
                VALUES 
                    (%(id)s, %(question)s, %(option1)s, %(option2)s, %(option3)s, 
                     %(option1_score)s, %(option2_score)s, %(option3_score)s)
                ON CONFLICT (id) DO NOTHING;
            """, q)
        
        conn.commit()
        print(f"Successfully inserted {len(questions)} risk questions!")
        
    except Exception as e:
        conn.rollback()
        print(f"Error inserting risk questions: {e}")
        raise
    finally:
        cur.close()
        conn.close()


if __name__ == "__main__":
    seed_risk_questions()

import os
import json
from tinyfish import TinyFish, EventType
from typing import List, Dict, Any

class TinyFishService:
    def __init__(self):
        self.api_key = os.getenv("TINYFISH_API_KEY")
        if self.api_key:
            self.client = TinyFish(api_key=self.api_key)
        else:
            self.client = None

    def search_hackathons(self, url: str, goal: str) -> List[Dict[str, Any]]:
        """
        Uses TinyFish to search a hackathon platform and extract hackathon details.
        Returns a JSON array of extracted data.
        """
        if not self.client:
            print("WARNING: TinyFish API Key missing. Returning mocked data.")
            return []

        results = []
        try:
            with self.client.agent.stream(url=url, goal=goal) as stream:
                for event in stream:
                    if event.type == EventType.COMPLETE:
                        if event.result_json:
                            # It might be a list or a dict containing a list
                            data = event.result_json
                            if isinstance(data, list):
                                return data
                            if isinstance(data, dict):
                                # Extract values if it returned a dict wrapper
                                for v in data.values():
                                    if isinstance(v, list):
                                        return v
                            return [data]
        except Exception as e:
            print(f"TinyFish Search Error: {e}")
        return results

    def register_team(self, url: str, instructions: str) -> Dict[str, Any]:
        """
        Uses TinyFish to run automated registration.
        """
        if not self.client:
            print("WARNING: TinyFish API Key missing. Simulating registration.")
            return {"status": "success", "run_id": "simulated_run_123"}
        
        try:
            with self.client.agent.stream(url=url, goal=instructions) as stream:
                logs = []
                final_result = None
                for event in stream:
                    logs.append(str(event))
                    if event.type == EventType.COMPLETE:
                        final_result = event.result_json
                return {
                    "status": "success",
                    "result": final_result,
                    "logs": "\n".join(logs)
                }
        except Exception as e:
            return {
                "status": "error",
                "logs": str(e)
            }

tinyfish_service = TinyFishService()

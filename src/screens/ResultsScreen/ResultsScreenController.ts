import { ScreenController } from "../../types.ts";
import type { ScreenSwitcher } from "../../types.ts";
import {
	ResultsScreenModel,
	type LeaderboardEntry,
} from "./ResultsScreenModel.ts";
import { ResultsScreenView } from "./ResultsScreenView.ts";

const LEADERBOARD_KEY = "lemonClickerLeaderboard";
const MAX_LEADERBOARD_ENTRIES = 5;

/**
 * ResultsScreenController - Handles results screen interactions
 */
export class ResultsScreenController extends ScreenController {
	private model: ResultsScreenModel;
	private view: ResultsScreenView;
	private screenSwitcher: ScreenSwitcher;

	private gameOverSound: HTMLAudioElement;

	constructor(screenSwitcher: ScreenSwitcher) {
		super();
		this.screenSwitcher = screenSwitcher;
		this.model = new ResultsScreenModel();
		this.view = new ResultsScreenView(() => this.handlePlayAgainClick());

		// TODO: Task 4 - Initialize game over sound audio
		this.gameOverSound = new Audio("/gameOver.mp3"); // Placeholder
	}

	/**
	 * Show results screen with final score
	 */
	showResults(finalScore: number): void {
		this.model.setFinalScore(finalScore);
		this.view.updateFinalScore(finalScore);

		// Load and update leaderboard
		const entries = this.loadLeaderboard();
		entries.push({
			score: finalScore,
			timestamp: new Date().toLocaleString(),
		});
		entries.sort((a, b) => b.score - a.score); // Sort descending
		const top5 = entries.slice(0, MAX_LEADERBOARD_ENTRIES); // Keep top 5
		this.saveLeaderboard(top5);
		this.model.setLeaderboard(top5);
		this.view.updateLeaderboard(top5);

		this.view.show();

		// TODO: Task 4 - Play the game over sound
		this.gameOverSound.currentTime = 0; // Reset to start
		this.gameOverSound.play();
	}

	/**
	 * Show results screen with final score from server
	 */
  async showResultsFromServer(finalScore: number): Promise<void> {
    try {
  		this.model.setFinalScore(finalScore);
  		this.view.updateFinalScore(finalScore);
  
  		// Load and update leaderboard
  		const entries = await this.loadLeaderboardFromServer();
  		entries.push({
  			score: finalScore,
  			timestamp: new Date().toLocaleString(),
  		});
  		entries.sort((a, b) => b.score - a.score); // Sort descending
  		const top5 = entries.slice(0, MAX_LEADERBOARD_ENTRIES); // Keep top 5
  		await this.saveLeaderboardToServer(top5);
  		this.model.setLeaderboard(top5);
  		this.view.updateLeaderboard(top5);
  
  		this.view.show();
  		this.gameOverSound.currentTime = 0; // Reset to start
      this.gameOverSound.play();
    } catch (error) {
      console.error("Error loading/saving leaderboard from/to server:", error);
      // Fallback to localStorage if server fails
      this.showResults(finalScore);
    }
	}
	/**
	 * Load leaderboard from localStorage
	 */
	private loadLeaderboard(): LeaderboardEntry[] {
		// TODO: Task 5 - Load leaderboard from localStorage
		const stored = localStorage.getItem(LEADERBOARD_KEY);
		if (stored) {
			try {
				const parsed = JSON.parse(stored);
				if (Array.isArray(parsed)) {
					return parsed;
				}
			} catch {
				// Ignore JSON parse errors
			}
		}
		return []; // Placeholder
	}

	/**
	 * async loadLeaderboardFromServer(): Promise<LeaderboardEntry[]>
	 * Send a GET request with const response = await fetch("/api/leaderboard") 
	 * If !response.ok, throw new Error("Unable to load leaderboard").
	 * Return (await response.json()) as LeaderboardEntry[].
	 */
	async loadLeaderboardFromServer(): Promise<LeaderboardEntry[]> {
		const response = await fetch("/api/leaderboard");
		if (!response.ok) {
			throw new Error("Unable to load leaderboard");
		}
		return (await response.json()) as LeaderboardEntry[];
  }
  
	/**
	 * async saveLeaderboardToServer(entries: LeaderboardEntry[]): Promise<void>
		Send the array in a POST request:
		const response = await fetch("/api/leaderboard", {
     method: "POST",
     headers: { "Content-Type": "application/json" },
     body: JSON.stringify(entries),
     });
		If !response.ok, throw new Error("Unable to save leaderboard").
	 */
	async saveLeaderboardToServer(entries: LeaderboardEntry[]): Promise<void> {
    const response = await fetch("/api/leaderboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entries),
    });
    if (!response.ok) {
      throw new Error("Unable to save leaderboard");
    }
  }
	/**
	 * Save leaderboard to localStorage
	 */
	private saveLeaderboard(entries: LeaderboardEntry[]): void {
		localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries));
	}

	/**
	 * Handle play again button click
	 */
	private handlePlayAgainClick(): void {
		this.screenSwitcher.switchToScreen({ type: "menu" });
	}

	/**
	 * Get the view
	 */
	getView(): ResultsScreenView {
		return this.view;
	}
}

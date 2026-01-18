#!/usr/bin/env python3
"""
CodeChef Data Visualization using Pandas and Matplotlib
Displays scraped CodeChef user data with charts and graphs
"""

import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from datetime import datetime
import json
import sys
import os

def load_data_from_scraper(username):
    """Run scraper and get data"""
    sys.path.insert(0, os.path.dirname(__file__))
    from codechef_scraper import scrape_codechef_user
    
    print(f"Scraping data for {username}...")
    data = scrape_codechef_user(username, include_contest_history=True)
    return data

def visualize_codechef_data(data, username, save_path=None):
    """
    Create comprehensive visualizations for CodeChef user data
    """
    if not data:
        print("No data to visualize!")
        return
    
    # Create figure with subplots
    fig = plt.figure(figsize=(16, 12))
    gs = fig.add_gridspec(3, 3, hspace=0.3, wspace=0.3)
    
    # 1. Profile Summary (Text)
    ax1 = fig.add_subplot(gs[0, 0])
    ax1.axis('off')
    summary_text = f"""
    CodeChef Profile: {username}
    {'='*40}
    Name: {data.get('name', 'N/A')}
    Rating: {data.get('rating', 0)} ({data.get('division', 'N/A')})
    Max Rating: {data.get('maxRating', 0)}
    Global Rank: {data.get('globalRank', 0):,}
    Country Rank: {data.get('countryRank', 0):,}
    
    Problems Solved: {data.get('totalSolved', 0)}
    Contests Attended: {data.get('contestsAttended', 0)}
    Total Submissions: {data.get('totalSubmissions', 0)}
    
    Country: {data.get('country', 'N/A')}
    Institution: {data.get('institution', 'N/A')[:30]}
    """
    ax1.text(0.1, 0.5, summary_text, fontsize=10, verticalalignment='center',
             family='monospace', bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5))
    
    # 2. Submission Heatmap Timeline
    ax2 = fig.add_subplot(gs[0, 1:])
    if data.get('submissionHeatmap'):
        df_submissions = pd.DataFrame(data['submissionHeatmap'])
        df_submissions['date'] = pd.to_datetime(df_submissions['date'], errors='coerce')
        df_submissions = df_submissions.dropna(subset=['date'])
        df_submissions = df_submissions.sort_values('date')
        
        ax2.plot(df_submissions['date'], df_submissions['count'], 
                marker='o', linewidth=2, markersize=4, color='#2E86AB')
        ax2.fill_between(df_submissions['date'], df_submissions['count'], 
                         alpha=0.3, color='#2E86AB')
        ax2.set_title('Submission Activity Timeline', fontsize=12, fontweight='bold')
        ax2.set_xlabel('Date')
        ax2.set_ylabel('Submissions per Day')
        ax2.grid(True, alpha=0.3)
        ax2.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d'))
        plt.setp(ax2.xaxis.get_majorticklabels(), rotation=45, ha='right')
    else:
        ax2.text(0.5, 0.5, 'No submission data available', 
                ha='center', va='center', transform=ax2.transAxes)
        ax2.set_title('Submission Activity Timeline', fontsize=12, fontweight='bold')
    
    # 3. Submission Statistics Bar Chart
    ax3 = fig.add_subplot(gs[1, 0])
    stats = data.get('submissionStats', {})
    if stats:
        categories = ['Days with\nSubmissions', 'Max Daily\nSubmissions', 'Avg Daily\nSubmissions']
        values = [
            stats.get('daysWithSubmissions', 0),
            stats.get('maxDailySubmissions', 0),
            round(stats.get('avgDailySubmissions', 0), 1)
        ]
        colors = ['#A23B72', '#F18F01', '#C73E1D']
        bars = ax3.bar(categories, values, color=colors, alpha=0.7)
        ax3.set_title('Submission Statistics', fontsize=11, fontweight='bold')
        ax3.set_ylabel('Count')
        for bar, val in zip(bars, values):
            height = bar.get_height()
            ax3.text(bar.get_x() + bar.get_width()/2., height,
                    f'{val}', ha='center', va='bottom', fontweight='bold')
    
    # 4. Monthly Submission Distribution
    ax4 = fig.add_subplot(gs[1, 1])
    if data.get('submissionByDate'):
        df_monthly = pd.DataFrame([
            {'date': k, 'count': v} 
            for k, v in data['submissionByDate'].items()
        ])
        df_monthly['date'] = pd.to_datetime(df_monthly['date'], errors='coerce')
        df_monthly = df_monthly.dropna(subset=['date'])
        df_monthly['month'] = df_monthly['date'].dt.to_period('M')
        monthly_sum = df_monthly.groupby('month')['count'].sum()
        
        monthly_sum.plot(kind='bar', ax=ax4, color='#06A77D', alpha=0.7)
        ax4.set_title('Monthly Submission Distribution', fontsize=11, fontweight='bold')
        ax4.set_xlabel('Month')
        ax4.set_ylabel('Total Submissions')
        ax4.tick_params(axis='x', rotation=45)
        plt.setp(ax4.xaxis.get_majorticklabels(), rotation=45, ha='right')
    
    # 5. Rating vs Problems Solved (if available)
    ax5 = fig.add_subplot(gs[1, 2])
    rating = data.get('rating', 0)
    problems = data.get('totalSolved', 0)
    max_rating = data.get('maxRating', rating)
    
    categories = ['Current\nRating', 'Max\nRating', 'Problems\nSolved']
    values = [rating, max_rating, problems]
    colors_map = ['#2E86AB', '#A23B72', '#06A77D']
    
    bars = ax5.bar(categories, values, color=colors_map, alpha=0.7)
    ax5.set_title('Rating & Problems Overview', fontsize=11, fontweight='bold')
    ax5.set_ylabel('Value')
    for bar, val in zip(bars, values):
        height = bar.get_height()
        ax5.text(bar.get_x() + bar.get_width()/2., height,
                f'{val:,}', ha='center', va='bottom', fontweight='bold', fontsize=9)
    
    # 6. Contest History Timeline (if available)
    ax6 = fig.add_subplot(gs[2, :])
    if data.get('recentContests') and len(data['recentContests']) > 0:
        contests = data['recentContests'][:15]  # Show last 15 contests
        contest_names = [c.get('name', c.get('contestCode', 'Unknown'))[:20] for c in contests]
        contest_ratings = [c.get('rating', 0) for c in contests]
        contest_ranks = [c.get('rank', 0) for c in contests if c.get('rank', 0) > 0]
        
        if contest_ratings:
            ax6_twin = ax6.twinx()
            x_pos = range(len(contest_names))
            ax6.bar(x_pos, contest_ratings, alpha=0.6, color='#2E86AB', label='Rating')
            if contest_ranks:
                ax6_twin.plot(x_pos[:len(contest_ranks)], contest_ranks, 
                            marker='o', color='#C73E1D', linewidth=2, label='Rank')
                ax6_twin.set_ylabel('Rank (lower is better)', color='#C73E1D')
                ax6_twin.invert_yaxis()
            
            ax6.set_xlabel('Contest')
            ax6.set_ylabel('Rating', color='#2E86AB')
            ax6.set_title('Recent Contest Performance', fontsize=12, fontweight='bold')
            ax6.set_xticks(x_pos)
            ax6.set_xticklabels(contest_names, rotation=45, ha='right')
            ax6.grid(True, alpha=0.3)
            ax6.legend(loc='upper left')
            if contest_ranks:
                ax6_twin.legend(loc='upper right')
    else:
        ax6.text(0.5, 0.5, 'No contest history available', 
                ha='center', va='center', transform=ax6.transAxes, fontsize=12)
        ax6.set_title('Recent Contest Performance', fontsize=12, fontweight='bold')
    
    # Overall title
    fig.suptitle(f'CodeChef Profile Analysis: {username}', 
                fontsize=16, fontweight='bold', y=0.98)
    
    # Save or show
    if save_path:
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
        print(f"Visualization saved to: {save_path}")
    else:
        plt.show()

def create_submission_heatmap_calendar(data, username, save_path=None):
    """Create a calendar-style heatmap of submissions"""
    if not data.get('submissionByDate'):
        print("No submission data for heatmap!")
        return
    
    import numpy as np
    from matplotlib.patches import Rectangle
    
    # Prepare data
    df = pd.DataFrame([
        {'date': k, 'count': v} 
        for k, v in data['submissionByDate'].items()
    ])
    df['date'] = pd.to_datetime(df['date'], errors='coerce')
    df = df.dropna(subset=['date'])
    df = df.sort_values('date')
    
    # Create calendar heatmap
    fig, ax = plt.subplots(figsize=(14, 8))
    
    # Group by week
    df['year'] = df['date'].dt.year
    df['week'] = df['date'].dt.isocalendar().week
    df['day'] = df['date'].dt.dayofweek
    
    # Create pivot table
    pivot = df.pivot_table(values='count', index='week', columns='day', aggfunc='sum', fill_value=0)
    
    # Create heatmap
    im = ax.imshow(pivot.values, cmap='YlGnBu', aspect='auto')
    
    # Labels
    days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    ax.set_xticks(range(7))
    ax.set_xticklabels(days)
    ax.set_ylabel('Week of Year')
    ax.set_title(f'Submission Heatmap Calendar - {username}', fontsize=14, fontweight='bold')
    
    # Colorbar
    plt.colorbar(im, ax=ax, label='Submissions')
    
    if save_path:
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
        print(f"Heatmap saved to: {save_path}")
    else:
        plt.show()

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Visualize CodeChef user data')
    parser.add_argument('username', help='CodeChef username')
    parser.add_argument('--save', '-s', help='Save path for visualization')
    parser.add_argument('--heatmap', '-h', action='store_true', help='Create calendar heatmap')
    parser.add_argument('--data-file', '-f', help='Load data from JSON file instead of scraping')
    
    args = parser.parse_args()
    
    # Load data
    if args.data_file:
        with open(args.data_file, 'r') as f:
            data = json.load(f)
    else:
        data = load_data_from_scraper(args.username)
    
    if data:
        # Main visualization
        visualize_codechef_data(data, args.username, 
                               save_path=args.save if args.save else None)
        
        # Calendar heatmap if requested
        if args.heatmap:
            heatmap_path = args.save.replace('.png', '_heatmap.png') if args.save else None
            create_submission_heatmap_calendar(data, args.username, save_path=heatmap_path)
    else:
        print("Failed to load data!")



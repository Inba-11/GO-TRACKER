#!/usr/bin/env python3
"""
CodeChef Heatmap Visualizer - Complete Adaptation
Integrates with existing codechef_scraper.py
Creates beautiful visualizations including GitHub-style heatmap, dashboard, and contest tables
"""
import sys
import os
import io
from datetime import datetime, timedelta
import json
import re

# Set UTF-8 encoding for Windows console
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

try:
    import pandas as pd
    import numpy as np
    import matplotlib.pyplot as plt
    import seaborn as sns
    HAS_VIS_LIBS = True
except ImportError:
    HAS_VIS_LIBS = False
    print("⚠️  Visualization libraries not found. Install with: pip install pandas numpy matplotlib seaborn")

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from codechef_scraper import scrape_codechef_user
import logging

logging.basicConfig(level=logging.WARNING)  # Suppress info logs


class CodeChefHeatmapVisualizer:
    """Complete CodeChef visualization suite"""
    
    def __init__(self, username):
        self.username = username
        self.data = None
        
    def fetch_data(self):
        """Fetch data using existing scraper"""
        print(f"\n🔍 Fetching data for: {self.username}")
        print(f"   URL: https://www.codechef.com/users/{self.username}\n")
        
        self.data = scrape_codechef_user(self.username, include_contest_history=True)
        return self.data is not None
    
    def create_github_style_heatmap(self, save_path=None):
        """Create GitHub-style contribution heatmap"""
        if not HAS_VIS_LIBS:
            print("❌ Visualization libraries required")
            return None
            
        if not self.data or not self.data.get('submissionHeatmap'):
            print("❌ No submission heatmap data available")
            return None
        
        heatmap_data = self.data['submissionHeatmap']
        
        if not heatmap_data:
            print("⚠️  Empty heatmap data")
            return None
        
        # Convert to DataFrame
        dates = []
        submissions = []
        
        for entry in heatmap_data:
            date_str = entry.get('date', '')
            count = entry.get('count', 0)
            
            try:
                date_obj = datetime.strptime(date_str, '%Y-%m-%d')
                dates.append(date_obj)
                submissions.append(count)
            except:
                try:
                    date_obj = datetime.strptime(date_str, '%Y-%m-%d')
                    dates.append(date_obj)
                    submissions.append(count)
                except:
                    continue
        
        if not dates:
            print("⚠️  No valid dates found")
            return None
        
        df = pd.DataFrame({
            'date': pd.to_datetime(dates),
            'submissions': submissions
        })
        
        # Sort by date
        df = df.sort_values('date')
        
        # Create full date range (last 365 days)
        end_date = df['date'].max() if len(df) > 0 else datetime.now()
        start_date = end_date - timedelta(days=365)
        
        # Create complete date range
        date_range = pd.date_range(start=start_date, end=end_date, freq='D')
        df_full = pd.DataFrame({'date': date_range})
        df_full = df_full.merge(df, on='date', how='left')
        df_full['submissions'] = df_full['submissions'].fillna(0).astype(int)
        
        # Prepare for heatmap
        df_full['week'] = df_full['date'].dt.isocalendar().week
        df_full['day'] = df_full['date'].dt.dayofweek
        df_full['year'] = df_full['date'].dt.year
        
        # Create pivot table
        pivot = df_full.pivot_table(
            values='submissions', 
            index='day', 
            columns='week',
            aggfunc='sum', 
            fill_value=0
        )
        
        # Create visualization
        fig, ax = plt.subplots(figsize=(20, 5))
        
        # Use green color scheme (like GitHub)
        sns.heatmap(
            pivot, 
            cmap='YlGn',  # Yellow-Green colormap (like GitHub)
            linewidths=0.5, 
            linecolor='white',
            cbar_kws={'label': 'Submissions per day'},
            ax=ax,
            square=True,
            vmin=0,
            fmt='g'
        )
        
        # Set labels
        ax.set_title(
            f'{self.username} - CodeChef Submission Heatmap (Last 365 Days)', 
            fontsize=16, 
            fontweight='bold', 
            pad=20
        )
        ax.set_xlabel('Week of Year', fontsize=12)
        ax.set_ylabel('')
        ax.set_yticklabels(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], rotation=0)
        
        plt.tight_layout()
        
        # Save if path provided
        if save_path:
            fig.savefig(save_path, dpi=300, bbox_inches='tight')
            print(f"✅ Heatmap saved: {save_path}")
        
        return fig
    
    def create_contest_table(self, save_path=None):
        """Create visualization table for recent contests"""
        if not HAS_VIS_LIBS:
            return None
            
        contests = self.data.get('recentContests', [])
        
        if not contests:
            print("⚠️  No recent contests data available")
            return None
        
        fig, ax = plt.subplots(figsize=(16, 10))
        ax.axis('tight')
        ax.axis('off')
        
        # Prepare table data
        table_data = []
        headers = ['#', 'Contest Name', 'Date', 'Rating', 'Rank']
        
        for i, contest in enumerate(contests[:20], 1):  # Limit to 20
            contest_name = contest.get('name', contest.get('contestCode', 'N/A'))[:50]
            date = contest.get('date', 'N/A')
            if len(date) > 10:
                date = date[:10]  # Just show date part
            
            table_data.append([
                str(i),
                contest_name,
                date,
                str(contest.get('rating', 'N/A')),
                str(contest.get('rank', 'N/A'))
            ])
        
        # Create table
        table = ax.table(
            cellText=table_data, 
            colLabels=headers,
            cellLoc='left', 
            loc='center',
            colWidths=[0.05, 0.50, 0.15, 0.15, 0.15]
        )
        
        table.auto_set_font_size(False)
        table.set_fontsize(10)
        table.scale(1, 2.5)
        
        # Style header
        for i in range(len(headers)):
            cell = table[(0, i)]
            cell.set_facecolor('#3498db')
            cell.set_text_props(weight='bold', color='white')
        
        # Style rows with alternating colors
        for i in range(1, len(table_data) + 1):
            for j in range(len(headers)):
                cell = table[(i, j)]
                if i % 2 == 0:
                    cell.set_facecolor('#ecf0f1')
                else:
                    cell.set_facecolor('#ffffff')
        
        plt.title('Recent Contest Activity', fontsize=18, fontweight='bold', pad=20)
        plt.tight_layout()
        
        if save_path:
            fig.savefig(save_path, dpi=300, bbox_inches='tight')
            print(f"✅ Contest table saved: {save_path}")
        
        return fig
    
    def create_profile_dashboard(self, save_path=None):
        """Create comprehensive profile dashboard"""
        if not HAS_VIS_LIBS:
            return None
            
        if not self.data:
            return None
        
        fig, axes = plt.subplots(2, 2, figsize=(16, 12))
        fig.suptitle(
            f"CodeChef Profile Dashboard - {self.username}", 
            fontsize=20, 
            fontweight='bold', 
            y=0.995
        )
        
        # Profile stats text box
        ax1 = axes[0, 0]
        ax1.axis('off')
        
        stats_text = f"""
        Username: {self.data.get('username', 'N/A')}
        Name: {self.data.get('name', 'N/A')}
        Country: {self.data.get('country', 'N/A')}
        Institution: {self.data.get('institution', 'N/A')}
        
        Current Rating: {self.data.get('rating', 0)}
        Highest Rating: {self.data.get('maxRating', 0)}
        Stars: {self.data.get('stars', 0)}★
        
        Global Rank: {self.data.get('globalRank', 'N/A')}
        Country Rank: {self.data.get('countryRank', 'N/A')}
        
        Total Problems: {self.data.get('totalSolved', 0)}
        Contests Attended: {self.data.get('contestsAttended', 0)}
        Total Submissions: {self.data.get('totalSubmissions', 0)}
        
        Division: {self.data.get('division', 'N/A')}
        League: {self.data.get('league', 'N/A')}
        """
        
        ax1.text(
            0.1, 0.5, stats_text, 
            fontsize=12, 
            family='monospace',
            verticalalignment='center',
            bbox=dict(boxstyle='round', facecolor='lightblue', alpha=0.5)
        )
        
        # Activity distribution pie
        ax2 = axes[0, 1]
        stats = self.data.get('submissionStats', {})
        try:
            active_days = stats.get('daysWithSubmissions', 0)
            if active_days > 0:
                # Estimate total days in range (365)
                total_days = 365
                inactive_days = max(0, total_days - active_days)
                
                sizes = [active_days, inactive_days]
                labels = [f'Active Days\n({active_days})', f'Inactive Days\n({inactive_days})']
                colors = ['#2ecc71', '#ecf0f1']
                
                ax2.pie(sizes, labels=labels, colors=colors, autopct='%1.1f%%',
                       startangle=90, textprops={'fontsize': 11})
                ax2.set_title('Activity Distribution', fontsize=14, fontweight='bold')
            else:
                ax2.text(0.5, 0.5, 'No activity data', ha='center', va='center')
                ax2.axis('off')
        except:
            ax2.text(0.5, 0.5, 'No data available', ha='center', va='center')
            ax2.axis('off')
        
        # Rating range indicator
        ax3 = axes[1, 0]
        try:
            current = int(self.data.get('rating', 0))
            if current > 0:
                ratings = ['0-1000', '1000-1400', '1400-1600', '1600-1800', '1800+']
                colors_rating = ['#808080', '#1abc9c', '#3498db', '#9b59b6', '#e74c3c']
                
                # Determine current range
                if current < 1000:
                    index = 0
                elif current < 1400:
                    index = 1
                elif current < 1600:
                    index = 2
                elif current < 1800:
                    index = 3
                else:
                    index = 4
                
                highlighted = [0.3] * 5
                highlighted[index] = 1.0
                
                ax3.bar(ratings, [1]*5, color=colors_rating, alpha=highlighted)
                ax3.axhline(y=0.5, color='red', linestyle='--', linewidth=2, 
                           label=f'Current: {current}')
                ax3.set_title('Rating Range', fontsize=14, fontweight='bold')
                ax3.set_ylabel('Active Range')
                ax3.legend()
            else:
                ax3.text(0.5, 0.5, 'Rating data unavailable', ha='center', va='center')
                ax3.axis('off')
        except:
            ax3.text(0.5, 0.5, 'Rating data unavailable', ha='center', va='center')
            ax3.axis('off')
        
        # Key metrics bar chart
        ax4 = axes[1, 1]
        try:
            categories = ['Total\nProblems', 'Contests\nJoined', 'Total\nSubmissions']
            values = [
                int(self.data.get('totalSolved', 0)),
                int(self.data.get('contestsAttended', 0)),
                int(self.data.get('totalSubmissions', 0))
            ]
            
            bars = ax4.bar(categories, values, color=['#3498db', '#e74c3c', '#2ecc71'])
            ax4.set_title('Key Metrics', fontsize=14, fontweight='bold')
            ax4.set_ylabel('Count')
            
            # Add value labels on bars
            for bar, val in zip(bars, values):
                height = bar.get_height()
                ax4.text(bar.get_x() + bar.get_width()/2., height,
                        f'{val}', ha='center', va='bottom', fontweight='bold')
        except:
            ax4.text(0.5, 0.5, 'Metrics unavailable', ha='center', va='center')
            ax4.axis('off')
        
        plt.tight_layout()
        
        if save_path:
            fig.savefig(save_path, dpi=300, bbox_inches='tight')
            print(f"✅ Dashboard saved: {save_path}")
        
        return fig
    
    def export_data_to_csv(self, base_filename=None):
        """Export data to CSV files"""
        if not HAS_VIS_LIBS:
            print("⚠️  Pandas required for CSV export")
            return
            
        if base_filename is None:
            base_filename = self.username
        
        try:
            # Profile data
            profile_data = {
                'username': self.data.get('username', ''),
                'rating': self.data.get('rating', 0),
                'maxRating': self.data.get('maxRating', 0),
                'globalRank': self.data.get('globalRank', 0),
                'countryRank': self.data.get('countryRank', 0),
                'totalSolved': self.data.get('totalSolved', 0),
                'contestsAttended': self.data.get('contestsAttended', 0),
                'totalSubmissions': self.data.get('totalSubmissions', 0),
                'stars': self.data.get('stars', 0),
                'division': self.data.get('division', ''),
                'league': self.data.get('league', ''),
            }
            
            df_profile = pd.DataFrame([profile_data])
            df_profile.to_csv(f'{base_filename}_profile.csv', index=False)
            print(f"✅ Profile data: {base_filename}_profile.csv")
            
            # Submission heatmap
            if self.data.get('submissionHeatmap'):
                heatmap_list = self.data['submissionHeatmap']
                df_heatmap = pd.DataFrame(heatmap_list)
                df_heatmap.to_csv(f'{base_filename}_heatmap_data.csv', index=False)
                print(f"✅ Heatmap data: {base_filename}_heatmap_data.csv")
            
            # Recent contests
            if self.data.get('recentContests'):
                df_contests = pd.DataFrame(self.data['recentContests'])
                df_contests.to_csv(f'{base_filename}_recent_contests.csv', index=False)
                print(f"✅ Contest data: {base_filename}_recent_contests.csv")
                
        except Exception as e:
            print(f"⚠️  Error exporting CSV: {e}")
    
    def print_text_summary(self):
        """Print text-based summary (no libraries required)"""
        if not self.data:
            print("❌ No data available")
            return
        
        print(f"\n{'='*80}")
        print(f"  📊 CODECHEF PROFILE SUMMARY - {self.username.upper()}")
        print(f"{'='*80}")
        print(f"  Username: {self.data.get('username', 'N/A')}")
        print(f"  Rating: {self.data.get('rating', 0)} (Max: {self.data.get('maxRating', 0)})")
        print(f"  Global Rank: {self.data.get('globalRank', 'N/A')}")
        print(f"  Country Rank: {self.data.get('countryRank', 'N/A')}")
        print(f"  Stars: {self.data.get('stars', 0)}★")
        print(f"  Total Problems: {self.data.get('totalSolved', 0)}")
        print(f"  Contests Attended: {self.data.get('contestsAttended', 0)}")
        print(f"  Total Submissions: {self.data.get('totalSubmissions', 0)}")
        
        stats = self.data.get('submissionStats', {})
        if stats:
            print(f"\n  📈 Submission Statistics:")
            print(f"    Active Days: {stats.get('daysWithSubmissions', 0)}")
            print(f"    Max Daily: {stats.get('maxDailySubmissions', 0)}")
            print(f"    Avg Daily: {stats.get('avgDailySubmissions', 0):.2f}")
        
        # Recent submissions
        heatmap_data = self.data.get('submissionHeatmap', [])
        if heatmap_data:
            sorted_data = sorted(
                heatmap_data,
                key=lambda x: datetime.strptime(x.get('date', '2000-01-01'), '%Y-%m-%d'),
                reverse=True
            )[:30]
            
            print(f"\n  🔥 RECENT SUBMISSIONS (Last 30 Days)")
            print(f"  {'─'*76}")
            for entry in sorted_data:
                date_str = entry.get('date', '')
                count = entry.get('count', 0)
                bar = '█' * min(count, 40)
                print(f"    {date_str}: {count:3d} submissions {bar}")
        
        print(f"\n{'='*80}\n")


def main():
    username = 'kit27csbs01'
    
    if len(sys.argv) > 1:
        username = sys.argv[1]
    
    print("=" * 80)
    print(f"CodeChef Heatmap Visualizer - Complete Edition")
    print(f"Target: https://www.codechef.com/users/{username}")
    print("=" * 80)
    
    # Initialize visualizer
    viz = CodeChefHeatmapVisualizer(username)
    
    # Fetch data
    if not viz.fetch_data():
        print("❌ Failed to fetch data")
        return
    
    # Print text summary
    viz.print_text_summary()
    
    # Create visualizations if libraries available
    if HAS_VIS_LIBS:
        print("\n📊 Creating visualizations...")
        
        # GitHub-style heatmap
        heatmap_file = f'{username}_heatmap.png'
        viz.create_github_style_heatmap(save_path=heatmap_file)
        
        # Profile dashboard
        dashboard_file = f'{username}_dashboard.png'
        viz.create_profile_dashboard(save_path=dashboard_file)
        
        # Contest table
        contest_file = f'{username}_contests.png'
        viz.create_contest_table(save_path=contest_file)
        
        # Export to CSV
        print("\n📁 Exporting data to CSV...")
        viz.export_data_to_csv()
        
        print(f"\n✅ All visualizations and exports completed!")
        print(f"\nGenerated Files:")
        print(f"   📊 {heatmap_file}")
        print(f"   📊 {dashboard_file}")
        print(f"   📊 {contest_file}")
        print(f"   📄 {username}_profile.csv")
        print(f"   📄 {username}_heatmap_data.csv")
        print(f"   📄 {username}_recent_contests.csv")
    else:
        print("\n⚠️  Install visualization libraries for PNG output:")
        print("   pip install pandas numpy matplotlib seaborn")
    
    print("\n" + "=" * 80)


if __name__ == "__main__":
    main()


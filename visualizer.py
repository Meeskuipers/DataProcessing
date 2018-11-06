#!/usr/bin/env python
# Mees Kuipers:
# 11288477
# This file take the values out of the csv file that was made by movie.py.
# Each year, the average of all the films was calculated. With this INFORMATION
# a plot was madeself.

"""
This script visualizes data obtained from a .csv file
"""

import csv
import matplotlib.pyplot as plt

# Global constants for the input file, first and last year
INPUT_CSV = "movies.csv"
START_YEAR = 2008
END_YEAR = 2018
# This is a nice style for the plot
plt.style.use('ggplot')

# This is de dictionary that were all the ratings were combined per year.
average = {}
# The delimiter was used cause in movie.py the seperation was made with ";"
csv = csv.reader(open("movies.csv"), delimiter=';')
# For every line in the csv file the year was taken. if this year already was
# in the dictionary the year was added with the associated rating. Otherwise
# the rating was added to the list from the associated year.
for line in csv:
    if line[2] in average:
        average[line[2]].append(line[1])
    else:
        # The first line were no numbers
        if line[2].isdigit():
            average[line[2]] = [line[1]]
# In this loop de average of all the values were calculated and put in the last
# place of the dictionary.
for year in average:
    total = 0
    for rating in average[year]:
        total = float(total) + float(rating)
    av = total / len(average[year])
    average[year].append(av)

# Global dictionary for the data. The last value of the dictionary is the average
data_dict = {str(key): [average[str(key)][-1]] for key in range(START_YEAR, END_YEAR)}
# These are the values that the plot uses to make a plot
years = list(data_dict.keys())
averages = list(data_dict.values())

if __name__ == "__main__":
    # This is for the lay-out of the plot.
    plt.plot(years, averages, 'g-o', label='Movie rating')
    plt.xlabel('Years')
    plt.ylabel('Average rating')
    plt.legend()
    plt.show()

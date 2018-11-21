"""
Mees Kuipers
11288477

Convert a csv file to a json file
"""

import pandas
import csv


def panda_structure():
    with open('information.csv') as csv_file:
        csv_reader = csv.reader(csv_file)
        heads = next(csv_reader)
        heads.pop(0)

    data = pandas.read_csv('information.csv', delimiter=',', usecols=heads)
    data.to_json('information.json', orient='index')

if __name__ == "__main__":

    # Calling the function panda_structue
    panda_structure = panda_structure()

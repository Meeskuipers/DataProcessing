# Mees Kuipers
# 11288477
"""
This program will read information out of a csv file an put it in a pandas
DataFrame. This information is stripped until it was usefull to make some
plots. The information useful information was then stored in a csv and json file.
"""

import pandas
import csv
import numpy as np
import matplotlib.pyplot as plt


def panda_structure():

    # The names of the heads we need
    heads = ['Country', 'Region', 'Pop. Density (per sq. mi.)', 'Infant mortality (per 1000 births)', 'GDP ($ per capita) dollars']

    # read the information out of csv file
    data = pandas.read_csv('input.csv', delimiter=',', usecols=heads)

    # Strip the dollars
    data['GDP ($ per capita) dollars'] = data['GDP ($ per capita) dollars'].str.strip('dollars')

    # Put the information in een panda data frame
    panda_data = pandas.DataFrame(data=data)

    # Set the values to numeric data
    data['GDP ($ per capita) dollars'] = pandas.to_numeric(data['GDP ($ per capita) dollars'], errors='coerce').fillna(np.NaN)
    data['Infant mortality (per 1000 births)'] = data['Infant mortality (per 1000 births)'].str.replace(',','.')
    data['Infant mortality (per 1000 births)'] = pandas.to_numeric(data['Infant mortality (per 1000 births)'], errors='coerce').fillna(np.NaN)

    # Calculate the mean, median and standartdeviation
    mean = panda_data["GDP ($ per capita) dollars"].mean()
    median = data["GDP ($ per capita) dollars"].median()
    stdev = data["GDP ($ per capita) dollars"].std()
    print(mean)
    print(median)
    print(stdev)

    # Put the information back in a new csv file
    data.to_csv('information.csv', sep=';')

    # Plotting the GDP data
    GDP = panda_data.ix[:, 'GDP ($ per capita) dollars']
    f2 = GDP.hist(grid=True, bins=20, rwidth=0.9, color='#607c8e')
    plt.show()

    # Plotting the IF data
    IF = panda_data.ix[:, 'Infant mortality (per 1000 births)']
    f1 = IF.plot.box()
    plt.show()

    # Put the information in a json file
    panda_data.to_json('information.json')



if __name__ == "__main__":

    # Calling the function panda_structue
    panda_structure = panda_structure()

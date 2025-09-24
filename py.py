import os as os
import pandas as pd
df= pd.read_csv('churn.csv')
print(df.info())
print(df.isnull().sum())
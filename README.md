Generate bank statement for qonto account each month.

## Usage

Fill .env file as shown in .env.example file

  cp .env.example .env 

Configure a cronjob to run this command:
    
    node cronJob.js 

...every month to generate the bank statement of the previous month and upload the result as a csv file to a dropbox account.


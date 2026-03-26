Add-Type -AssemblyName System.Windows.Forms

# Function to create a form for COM port selection
function Show-ComPortSelectionForm {
    # Create the form
    $form = New-Object System.Windows.Forms.Form
    $form.Text = "Select a COM Port"
    $form.Size = New-Object System.Drawing.Size(400, 400)  # Set the size of the form
    $form.StartPosition = "CenterScreen"

    # Create a label to display a message
    $infoLabel = New-Object System.Windows.Forms.Label
    $infoLabel.Location = New-Object System.Drawing.Point(20, 20)
    $infoLabel.Size = New-Object System.Drawing.Size(340, 30)
    $infoLabel.Text = "Select a COM port."

    # Create a ListBox to hold the COM port items
    $comPortListBox = New-Object System.Windows.Forms.ListBox
    $comPortListBox.Location = New-Object System.Drawing.Point(20, 60)
    $comPortListBox.Size = New-Object System.Drawing.Size(340, 200)

    # Create a label for status output
    $statusLabel = New-Object System.Windows.Forms.Label
    $statusLabel.Location = New-Object System.Drawing.Point(20, 280)
    $statusLabel.Size = New-Object System.Drawing.Size(340, 60)
    $statusLabel.Text = "Status: Ready"
    $statusLabel.ForeColor = [System.Drawing.Color]::Black

    # Function to populate COM ports
    function PopulateComPorts {
        # Clear existing items
        $comPortListBox.Items.Clear()

        # Get all COM ports with "OK" status
        $comPorts = Get-PnpDevice | Where-Object { $_.Class -eq 'Ports' -and $_.Status -eq 'OK' }
        
        # Add full friendly name to the ListBox
        foreach ($comPort in $comPorts) {
            $comPortListBox.Items.Add($comPort.FriendlyName)
        }
    }

    # Populate COM ports initially
    PopulateComPorts

    # Event handler for mouse click
    $comPortListBox.Add_MouseClick({
        ProcessSelection
    })

    # Event handler for "Enter" key press
    $comPortListBox.Add_KeyDown({
        param($sender, $e)
        if ($e.KeyCode -eq 'Enter') {
            ProcessSelection
        }
    })

    # Function to process selection
    function ProcessSelection {
        if ($comPortListBox.SelectedItem) {
            # Get the selected full friendly name
            $selectedFriendlyName = $comPortListBox.SelectedItem

            # Extract the COMx part from the friendly name
            $selectedFriendlyName -match '(COM\d+)' | Out-Null
            $selectedComPort = $Matches[1]

            if ($selectedComPort) {
                # Clear the status label
                $statusLabel.Text = "Status: Executing..."
                $statusLabel.ForeColor = [System.Drawing.Color]::Black

                # Run the batch file with the extracted COM port (e.g., COM3)
                $process = Start-Process cmd.exe -ArgumentList "/c .\flash.bat $selectedComPort" -NoNewWindow -PassThru -Wait
                $exitCode = $process.ExitCode

                if ($exitCode -eq 0) {
                    # Successful execution
                    $statusLabel.Text = "Status: Execution completed successfully."
                    $statusLabel.ForeColor = [System.Drawing.Color]::Green
                } else {
                    # Error occurred
                    $statusLabel.Text = "Status: Error occurred during execution."
                    $statusLabel.ForeColor = [System.Drawing.Color]::Red
                }
            }
        }
    }

    # Create a timer for automatic updates
    $timer = New-Object System.Windows.Forms.Timer
    $timer.Interval = 1000  # Set interval to 1 second

    # Timer Tick event to refresh the COM port items
    $timer.Add_Tick({
        PopulateComPorts  # Refresh the COM port items
    })

    # Start the timer when the form is shown
    $form.Add_Shown({
        $timer.Start()
    })

    # Stop the timer when the form is closed
    $form.Add_FormClosing({
        $timer.Stop()
    })

    # Add controls to the form
    $form.Controls.Add($infoLabel)
    $form.Controls.Add($comPortListBox)  # Add the ListBox to the form
    $form.Controls.Add($statusLabel)     # Add the status label

    # Show the form
    $form.ShowDialog()
}

# Show the COM port selection dialog
Show-ComPortSelectionForm


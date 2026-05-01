##############################################################
#                                                            #
#    Mark Hoogendoorn and Burkhardt Funk (2017)              #
#    Machine Learning for the Quantified Self                #
#    Springer                                                #
#    Chapter 4                                               #
#                                                            #
##############################################################

# Updated by Dave Ebbelaar on 06-01-2023

import numpy as np


# This class performs a Fourier transformation on the data to find frequencies that occur
# often and filter noise.
class FourierTransformation:

    # Find the amplitudes of the different frequencies using a fast fourier transformation. Here,
    # the sampling rate expresses the number of samples per second (i.e. Frequency is Hertz of the dataset).
    def find_fft_transformation(self, data, sampling_rate):
        # Create the transformation, this includes the amplitudes of both the real
        # and imaginary part.
        transformation = np.fft.rfft(data, len(data))
        return transformation.real, transformation.imag

    # Get frequencies over a certain window.
    def abstract_frequency(self, data_table, cols, window_size, sampling_rate):
        # Create new columns for the frequency data.
        freqs = np.round((np.fft.rfftfreq(int(window_size)) * sampling_rate), 3)

        n_rows = len(data_table)
        
        # Pre-allocate dictionary of numpy arrays
        new_cols = {}
        for col in cols:
            new_cols[col + "_max_freq"] = np.full(n_rows, np.nan)
            new_cols[col + "_freq_weighted"] = np.full(n_rows, np.nan)
            new_cols[col + "_pse"] = np.full(n_rows, np.nan)
            for freq in freqs:
                new_cols[col + "_freq_" + str(freq) + "_Hz_ws_" + str(window_size)] = np.full(n_rows, np.nan)

        # Process column by column to avoid repeatedly getting values
        for col in cols:
            col_values = data_table[col].values
            
            for i in range(window_size, n_rows):
                window_data = col_values[i - window_size : min(i + 1, n_rows)]
                
                real_ampl, imag_ampl = self.find_fft_transformation(window_data, sampling_rate)
                
                # We only look at the real part in this implementation.
                for j, freq in enumerate(freqs):
                    new_cols[col + "_freq_" + str(freq) + "_Hz_ws_" + str(window_size)][i] = real_ampl[j]
                
                # Dominant frequency
                new_cols[col + "_max_freq"][i] = freqs[np.argmax(real_ampl)]
                
                # Weighted frequency
                sum_real = np.sum(real_ampl)
                if sum_real != 0:
                    new_cols[col + "_freq_weighted"][i] = float(np.sum(freqs * real_ampl)) / sum_real
                else:
                    new_cols[col + "_freq_weighted"][i] = 0.0
                
                # Power Spectral Entropy
                PSD = np.square(real_ampl) / float(len(real_ampl))
                sum_psd = np.sum(PSD)
                if sum_psd != 0:
                    PSD_pdf = PSD / sum_psd
                    
                    # Compute PSE safely avoiding log(0)
                    with np.errstate(divide='ignore', invalid='ignore'):
                        log_psd = np.log(PSD_pdf)
                        # np.nan_to_num replaces -inf with large negative numbers and nan with 0
                        log_psd = np.nan_to_num(log_psd, posinf=0, neginf=0, nan=0)
                        pse = -np.sum(log_psd * PSD_pdf)
                    new_cols[col + "_pse"][i] = pse

        # Assign all arrays to DataFrame at once
        for key, val in new_cols.items():
            data_table[key] = val

        return data_table

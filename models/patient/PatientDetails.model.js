const mongoose = require('mongoose');

const PatientDetailsSchema = new mongoose.Schema(
    {
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
            ref: 'PatientLogin',
        },
        firstName: {
            type: String,
            required: true,
            maxlength: 32,
            trim: true,
            validate: {
                validator: function (v) {
                    return /^[a-zA-Z]+$/.test(v);
                },
                message: (props) =>
                    `${props.value} must contain only alphabets`,
            },
        },
        middleName: {
            type: String,
            required: false,
            maxlength: 32,
            trim: true,
            validate: {
                validator: function (v) {
                    if (!v) return true; // middle name is optional
                    return /^[a-zA-Z]+$/.test(v);
                },
                message: (props) => `${props.path} must contain only alphabets`,
            },
        },
        lastName: {
            type: String,
            required: true,
            maxlength: 32,
            trim: true,
            validate: {
                validator: function (v) {
                    return /^[a-zA-Z]+$/.test(v);
                },
                message: (props) => `${props.path} must contain only alphabets`,
            },
        },
        suffix: {
            type: String,
            required: false,
            maxlength: 3,
            trim: true,
            validate: {
                validator: function (v) {
                    if (!v) return true; // suffix is optional
                    const validSuffixes = ['Jr.', 'Sr.', 'III', 'IV'];
                    return validSuffixes.includes(v);
                },
                message: (props) => {
                    console.log(props);
                    return `Suffix:${props.value} is not a valid suffix`;
                },
            },
        },
        birthdate: {
            type: Date,
            required: true,
            validate: {
                validator: function (v) {
                    // check if date is in the future
                    return v && v.getTime() < new Date().getTime();
                },
                message: 'Birthdate must be in the past',
            },
        },
        address: {
            type: new mongoose.Schema(
                {
                    houseNumber: {
                        type: String,
                        required: true,
                        maxlength: 32,
                        trim: true,
                    },
                    street: {
                        type: String,
                        required: true,
                        enum: [
                            'Aneceta St.',
                            'Atienza St.',
                            'MC NTYRE St.',
                            'Lapu-Lapu St.',
                            'San Felipe St.',
                            'San Juan St.',
                            'San Diego St.',
                            'Tangpuz St.',
                            'Reyes St.',
                            'Opao St.',
                            'Deaño St.',
                            'Manalili St.',
                            'Estante St.',
                            'Ganchenco St.',
                            'Osano St.',
                            'Pesado St.',
                            'Chavez St.',
                            'Diaz St.',
                            'Vila St.',
                            'Babas St.',
                            'Martizano St.',
                            'Mañarez St.',
                            'Contreras St.',
                            'Cristobal St. - Purok 4',
                            'Lozanes St.',
                            'Sunflower',
                            'Contreras St. - Sitio Central',
                            'Alintoga St.',
                            'Alit St.',
                            'Arago St.',
                            'Muertas St.',
                            'Sorongon St.',
                            'Doligosa St.',
                            'Holganza St.',
                            'Fernandez St.',
                            'Delvo St.',
                            'Paraiso St.',
                        ],
                    },
                    barangay: {
                        type: String,
                        required: false,
                        maxlength: 32,
                        trim: true,
                        default: 'Central Bicutan',
                    },
                    city: {
                        type: String,
                        required: false,
                        maxlength: 32,
                        trim: true,
                        default: 'Taguig City',
                    },
                },
                {
                    _id: false,
                }
            ),
            required: true,
        },
        sex: {
            type: String,
            enum: ['male', 'female'],
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

PatientDetailsSchema.methods.toJSON = function () {
    const patientDetails = this;
    const patientDetailsObject = patientDetails.toObject();

    delete patientDetailsObject._id;
    delete patientDetailsObject.__v;
    delete patientDetailsObject.createdAt;
    delete patientDetailsObject.updatedAt;

    return patientDetailsObject;
};

const PatientDetails = mongoose.model('PatientDetails', PatientDetailsSchema);

module.exports = { PatientDetailsSchema, PatientDetails };

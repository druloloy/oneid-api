const PatientConsultation = require('../models/patient/PatientConsultation.model');

exports.getTrendDiseases = async (req, res, next) => {
    try {
        const { start, end } = req.query;

        const uniqueIds = await PatientConsultation.find({
            createdAt: {
                $gte: start,
                $lte: end,
            },
        }).distinct('patientId');

        // get all unique conditions
        const uniqueConditions = await PatientConsultation.find({
            patientId: {
                $in: uniqueIds,
            },
            createdAt: {
                $gte: start,
                $lte: end,
            },
        }).select('condition');

        // count the number of times each condition appears
        const counter = uniqueConditions.reduce((acc, curr) => {
            const condition = curr.condition;
            if (acc[condition]) acc[condition]++;
            else acc[condition] = 1;
            return acc;
        }, {});

        // rank the conditions by number of times they appear, including the number of times they appear
        const rankedConditions = Object.entries(counter).sort(
            (a, b) => b[1] - a[1]
        );

        return res.status(200).json({
            success: true,
            data: rankedConditions,
        });
    } catch (error) {
        return next(error);
    }
};
